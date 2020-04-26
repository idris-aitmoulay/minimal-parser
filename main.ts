import { InputStream, TokenStream, parser } from './src';

const codeSource = `
  println("Hello World!");

  println(2 + 3 * 4);

  # functions are introduced with \`lambda\` or \`λ\`
  fib = lambda (n) if n < 2 then n else fib(n - 1) + fib(n - 2);

  println(fib(15));

  print-range = λ(a, b)             # \`λ\` is synonym to \`lambda\`
                  if a <= b then {  # \`then\` here is optional as you can see below
                    print(a);
                    if a + 1 <= b {
                      print(", ");
                      print-range(a + 1, b);
                    } else println("");        # newline
                  };
  print-range(1, 5);
}
`;


const ast = parser(TokenStream(new InputStream(codeSource)));

console.log(ast)
