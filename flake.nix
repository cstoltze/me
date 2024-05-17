{
  description = "A Hugo site";

  inputs = {
    # for hugo 0.119.0
    nixpkgs.url = "nixpkgs/75a52265bda7fd25e06e3a67dee3f0354e73243c";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = [ pkgs.hugo ];
        };

        packages.hugo = pkgs.hugo;
      });
}

