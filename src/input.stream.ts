class InputStream {
  input: string;
  pos =  0;
  line = 1;
  col = 0;
  constructor(input: string) {
    this.input = input;
  }

  next() {
    let ch = this.input.charAt(this.pos++);
    if (ch == "\n") this.line++, this.col = 0; else this.col++;
    return ch;
  }


  peek() {
    return this.input.charAt(this.pos);
  }


  eof() {
    return this.peek() == ""
  }

  croak(msg) {
    throw new Error(msg + " (" + this.line + ":" + this.col + ")");
  }
}

export default InputStream;
