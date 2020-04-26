const FALSE = { type: "bool", value: false };
const PRECEDENCE = {
  "=": 1,
  "||": 2,
  "&&": 3,
  "<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,
  "+": 10, "-": 10,
  "*": 20, "/": 20, "%": 20,
};

const parse = input => {

  const unexpected = () => {
    input.croak("Unexpected token: " + JSON.stringify(input.peek()));
  }

  const parse_lambda = () => {
    return {
      type: "lambda",
      vars: delimited("(", ")", ",", parse_varname),
      body: parse_expression()
    };
  }

  const parse_bool = () => {
    return {
      type  : "bool",
      value : input.next().value == "true"
    };
  };

  const skip_kw = kw => {
    if (ParserValidator.is_kw(kw)) input.next();
    else input.croak("Expecting keyword: \"" + kw + "\"");
  };

  const parse_if = () => {
    skip_kw("if");
    const cond = parse_expression();
    if (!ParserValidator.is_punc("{")) skip_kw("then");
    const then = parse_expression();
    const ret: any = {
      type: "if",
      cond: cond,
      then: then,
    };
    if (ParserValidator.is_kw("else")) {
      input.next();
      ret.else = parse_expression();
    }
    return ret;
  };


  const parse_prog = () => {
    const prog = delimited("{", "}", ";", parse_expression);
    if (prog.length == 0) return FALSE;
    if (prog.length == 1) return prog[0];
    return { type: "prog", prog: prog };
  };




  const delimited = (start, stop, separator, parser) => {
    let a = [], first = true;
    ParserValidator.skip_punc(start);
    while (!input.eof()) {
      if (ParserValidator.is_punc(stop)) break;
      if (first) first = false; else ParserValidator.skip_punc(separator);
      if (ParserValidator.is_punc(stop)) break;
      a.push(parser());
    }
    ParserValidator.skip_punc(stop);
    return a;
  };


  const parse_call = func =>{
    return {
      type: "call",
      func: func,
      args: delimited("(", ")", ",", parse_expression),
    };
  };

  const maybe_call = expr => {
    expr = expr();
    return ParserValidator.is_punc("(") ? parse_call(expr) : expr;
  };

  const maybe_binary = (left, my_prec) => {
    const tok = ParserValidator.is_op(undefined);
    if (tok) {
      const his_prec = PRECEDENCE[tok.value];
      if (his_prec > my_prec) {
        input.next();
        return maybe_binary({
          type     : tok.value == "=" ? "assign" : "binary",
          operator : tok.value,
          left     : left,
          right    : maybe_binary(parse_atom(), his_prec)
        }, my_prec);
      }
    }
    return left;
  }

  const parse_atom = () => {
    return maybe_call(function(){
      if (ParserValidator.is_punc("(")) {
        input.next();
        const exp = parse_expression();
        ParserValidator.skip_punc(")");
        return exp;
      }
      if (ParserValidator.is_punc("{")) return parse_prog();
      if (ParserValidator.is_kw("if")) return parse_if();
      if (ParserValidator.is_kw("true") || ParserValidator.is_kw("false")) return parse_bool();
      if (ParserValidator.is_kw("lambda") || ParserValidator.is_kw("λ")) {
        input.next();
        return parse_lambda();
      }
      const tok = input.next();
      if (tok.type == "var" || tok.type == "num" || tok.type == "str")
        return tok;
      unexpected();
    });
  }


  const parse_expression = () => {
    return maybe_call(function(){
      return maybe_binary(parse_atom(), 0);
    });
  }




  const parse_varname = () => {
    const name = input.next();
    if (name.type != "var") input.croak("Expecting variable name");
    return name.value;
  }






  const parse_toplevel = () => {
    const prog = [];
    while (!input.eof()) {
      prog.push(parse_expression());
      if (!input.eof()) ParserValidator.skip_punc(";");
    }
    return { type: "prog", prog };
  };

  return parse_toplevel();



  // validator class for the parser.
  class ParserValidator {
    static is_kw = kw => {
      const tok = input.peek();
      return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
    };
    static is_op = op => {
      const tok = input.peek();
      return tok && tok.type == "op" && (!op || tok.value == op) && tok;
    };
    static is_punc = ch => {
      const tok = input.peek();
      return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
    };

    static skip_punc = ch => {
      if (ParserValidator.is_punc(ch)) input.next();
      else input.croak("Expecting punctuation: \"" + ch + "\"");
    };
  }
};

export default parse;

