{
  description = "splitr — split-screen iframe viewer, built as a single static HTML file";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      forAllSystems = nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        rec {
          # Result: $out/index.html — a self-contained page any web server can serve.
          splitr = pkgs.buildNpmPackage {
            pname = "splitr";
            version = "0.2.0";
            src = self;

            npmDepsHash = "sha256-kBg5Kq1pzH/0IxKlbB9AMMyhMcyAdhHcxEcZxvGbzGY=";

            # No .git in the Nix sandbox: pass the flake revision to the build
            # so the <meta name="commit"> tag stays accurate.
            env.GIT_COMMIT = self.shortRev or self.dirtyShortRev or "unknown";

            # vitest is not needed to build and vue-tsc runs in CI, keep the
            # build minimal and deterministic.
            npmBuildScript = "build";

            installPhase = ''
              runHook preInstall
              mkdir -p $out
              cp dist/index.html $out/
              runHook postInstall
            '';
          };
          default = splitr;
        }
      );

      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.nodejs_24
              pkgs.prefetch-npm-deps # refresh npmDepsHash after lockfile changes
            ];
          };
        }
      );
    };
}
