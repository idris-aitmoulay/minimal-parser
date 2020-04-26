import InputStream from './input.stream';
const keywords = [
  "if",
  "then",
  "else",
  "lambda",
  "λ",
  "true",
  "false"
];

const keywordPunc = [
  ",",
  ";",
  "(",
  ")",
  "{",
  "}",
  "[",
  "]"
];

const keywordOpChar = [
  "+",
  "-",
  "*",
  "/",
  "%",
  "=",
  "&",
  "|",
  "<",
  ">",
  "!"
];

const WhiteSpace = [
  " ","\t","\n"
];

class TokenStreamUtils {
  static is_digit = ch => /[0-9]/i.test(ch);
  static is_id_start = ch => /[a-zλ_]/i.test(ch);
  static is_id = ch =>  TokenStreamUtils.is_id_start(ch) || "?!-<>=0123456789".indexOf(ch) >= 0;
  static is_keyword = x => keywords.indexOf(x) >= 0;
  static is_punc = ch => keywordPunc.indexOf(ch) >= 0;
  static is_op_char = ch => keywordOpChar.indexOf(ch) >= 0;
  static is_whitespace = ch => WhiteSpace.indexOf(ch) != -1;
}

const TokenStream = (input: InputStream) => {
  let current = null;

  const skip_comment = () => {
    read_while(ch => ch != "\n" );
    input.next();
  };

  const read_while = predicate => {
    let str = "";
    while (!input.eof() && predicate(input.peek()))
      str += input.next();
    return str;
  };


  const read_number = () => {
    let has_dot = false;
    const number = read_while(ch => {
      if (ch === ".") {
        if (has_dot) return false;
        has_dot = true;
        return true;
      }
      return TokenStreamUtils.is_digit(ch);
    });
    return { type: "num", value: parseFloat(number) };
  };

  const read_ident = () => {
    const id = read_while(TokenStreamUtils.is_id);
    return {
      type  : TokenStreamUtils.is_keyword(id) ? "kw" : "var",
      value : id
    };
  };

  const read_escaped = end => {
    let escaped = false, str = "";
    input.next();
    while (!input.eof()) {
      let ch = input.next();
      if (escaped) {
        str += ch;
        escaped = false;
      } else if (ch == "\\") {
        escaped = true;
      } else if (ch == end) {
        break;
      } else {
        str += ch;
      }
    }
    return str;
  };

  const read_string = () => {
    return { type: "str", value: read_escaped('"') };
  };


  const read_next = () => {
    read_while(TokenStreamUtils.is_whitespace);
    if (input.eof()) return null;

    const ch = input.peek();

    if (ch === "#") {
      skip_comment();
      return next();
    }

    if (ch === '"') return read_string();

    if (TokenStreamUtils.is_digit(ch)) return read_number();


    if (TokenStreamUtils.is_id_start(ch)) return read_ident();

    if (TokenStreamUtils.is_punc(ch)) return ({
      type  : "punc",
      value : input.next()
    });

    if (TokenStreamUtils.is_op_char(ch)) return {
      type  : "op",
      value : read_while(TokenStreamUtils.is_op_char)
    };
    input.croak("Can't handle character: " + ch);
  };

  const next = () => {
    const tok = current;
    current = null;
    return tok || read_next();
  };

  const peek = () => {
    return current || (current = read_next());
  };

  const eof = () => {
    return peek() == null;
  };

  return {
    next,
    peek,
    eof,
    croak : input.croak
  }
};

export default TokenStream;
