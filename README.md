# The Garage

[![Tests](https://github.com/bomberJV/vehicle-garage/actions/workflows/tests.yml/badge.svg)](https://github.com/bomberJV/vehicle-garage/actions/workflows/tests.yml) · [Open it on brandonfhuang.com](https://brandonfhuang.com/projects/play/garage/)

Inspect and assemble vehicles in a browser-based 3D workbench.

From the repository root, run `python -m http.server 8000` and open [The Garage](http://localhost:8000/garage/).

Run `node --test tests/*.test.mjs` with Node 22 or newer.

[Controls, source notes and limitations](garage/README.md) · [Portfolio](https://brandonfhuang.com)

The standalone app uses browser-local storage where applicable. The portfolio supplies Google sign-in and account-backed saves.

## License

Created by Brandon Frank Han-Chween Huang ([brandonfhuang.com](https://brandonfhuang.com)).

- **Code** (scripts, styles, page markup, tests and tools): [Apache License 2.0](LICENSE). Keep the [NOTICE](NOTICE) file with any copy or derivative.
- **Writing, figures, papers, results and narration recordings**: [CC BY 4.0](LICENSE-CC-BY-4.0.txt). Credit “Brandon Frank Han-Chween Huang” and link to https://brandonfhuang.com or this repository.
- **Third-party files** keep their own licenses:
  - `shared/symbols.woff` is a DejaVu font subset under the Bitstream Vera license ([shared/FONT-LICENSE.txt](shared/FONT-LICENSE.txt)).
  - `garage/voice/runtime/` holds the Kitten TTS Nano voice model (Apache 2.0), ONNX Runtime Web (MIT), Phonemizer.js (Apache 2.0) and eSpeak NG (GPL-3.0). Their licenses and sources are listed in [garage/voice/runtime/NOTICE.txt](garage/voice/runtime/NOTICE.txt).
