{
  description = "coleman.stoltze.family -- Astro site with a Cloudflare Worker backend";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          # Node is all the app itself needs; wrangler and vitest come from npm.
          buildInputs = [ pkgs.nodejs_22 ];

          # Playwright's own Chromium download is dynamically linked against
          # libraries NixOS does not provide, so it fails with
          # "libglib-2.0.so.0: cannot open shared object file". Point Playwright
          # at the nixpkgs build instead.
          #
          # If `npm run test:e2e` complains that the browser is the wrong
          # version, the npm @playwright/test version and the nixpkgs
          # playwright-driver version have drifted apart; align them or run the
          # e2e suite in CI, where the npm-downloaded browsers work normally.
          PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
        };
      });
}
