; ── Comments ──
(comment) @comment

; ── Keywords ──
[
  "fn" "flow" "return" "if" "else" "match" "for" "loop"
  "struct" "enum" "interface" "impl" "type" "fileid"
  "import" "mut" "in"
  "go" "await"
  "true" "false" "unit"
  "auto"
] @keyword

; ── Types ──
[
  "int" "float" "bool" "string" "char" "never"
] @type.builtin

; ── Functions ──
(function_definition
  "fn" (identifier) @function)
(flow_definition
  "flow" (identifier) @function)
(method_signature
  "fn" (identifier) @method)
(call_expression . (identifier) @function)
(call_expression . (field_expression "." (identifier) @method))

; ── Parameters ──
(parameter . (identifier) @parameter)

; ── Identifiers ──
(identifier) @variable

; ── Literals ──
(string) @string
(char_literal) @string.special
(integer_literal) @number
(float_literal) @number

; ── Operators ──
[
  "+" "-" "*" "/" "%"
  "==" "!=" "<" ">" "<=" ">="
  "&&" "||"
  "=" ":="
  "->" "=>"
] @operator

; ── Punctuation ──
[
  ";" "," "."
  "{" "}" "(" ")" "[" "]"
  ":" "::"
] @punctuation

; ── Recv (special syntax) ──
(recv_expression) @function.builtin
