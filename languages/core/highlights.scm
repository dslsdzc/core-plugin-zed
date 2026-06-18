; ── Comments ──
(comment) @comment

; ── Keywords ──
[
  "fn" "flow" "return" "yield"
  "if" "else" "match" "for" "loop" "while" "break" "continue"
  "struct" "enum" "interface" "impl" "type" "fileid"
  "import" "as" "pub" "mod"
  "mut" "move" "ref"
  "go" "await" "recv"
  "unsafe"
  "requires" "ensures" "old"
  "true" "false"
  "None" "Some" "Ok" "Err"
  "unit"
] @keyword

"in" @keyword

; ── Types ──
[
  "int" "float" "bool" "string" "char" "never" "auto"
] @type.builtin

(self) @variable.builtin
(Self) @type

; ── Functions ──
(function_definition name: (identifier) @function)
(flow_definition name: (identifier) @function)
(method_signature name: (identifier) @method)

(call_expression function: (identifier) @function)
(call_expression function: (field_expression field: (identifier) @method))

; ── Parameters ──
(parameter name: (identifier) @parameter)

; ── Identifiers (fallback) ──
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
  "&&" "||" "!"
  "=" ":="
  ".."
  "->"
  "as"
] @operator

; ── Punctuation ──
[
  ";" "," "."
  "{" "}" "(" ")" "[" "]"
  ":" "::"
  "=>"
  "?" "&" "|"
] @punctuation

; ── Attributes / doc comments ──
; (attribute) @attribute
