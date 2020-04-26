import { InputStream, TokenStream, parser } from './src';

const codeSource = `
  println("Hello World!");

  println(2 + 3 * 4);
}
`;


const ast = parser(TokenStream(new InputStream(codeSource)));

console.log(ast)
