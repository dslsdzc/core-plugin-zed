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
(function_definition name: (identifier) @function)
(flow_definition name: (identifier) @function)
(method_signature name: (identifier) @method)
(call_expression function: (identifier) @function)

; ── Parameters ──
(parameter name: (identifier) @parameter)

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
  "->" "=>" ".."
] @operator

; ── Punctuation ──
[
  ";" "," "."
  "{" "}" "(" ")" "[" "]"
  ":" "::"
] @punctuation

; ── Recv (special syntax) ──
(recv_expression) @function.builtin
