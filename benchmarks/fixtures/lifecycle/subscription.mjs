export class Panel {
  constructor(source) { this.source = source; this.calls = 0; }
  open() { this.source.on("reward", () => this.calls++); }
  close() {}
}
