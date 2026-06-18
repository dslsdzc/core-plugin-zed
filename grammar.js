/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: 'core',

  extras: $ => [/\s/, $.comment, ';'],

  supertypes: $ => [$.expression, $._statement],

  conflicts: $ => [
    [$.type, $.expression],
    [$.call_expression, $.struct_literal],
    [$.go_expression, $.binary_expression],
    [$.go_expression, $.call_expression],
  ],

  rules: {
    source_file: $ => repeat($._definition),

    comment: $ => token(choice(
      seq('//', /[^\n]*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),

    _definition: $ => choice(
      $.function_definition,
      $.struct_definition,
      $.enum_definition,
      $.impl_definition,
      $.flow_definition,
      $.interface_definition,
      $.type_definition,
      $.import_declaration,
      $.fileid_declaration,
    ),

    function_definition: $ => seq(
      'fn', $.identifier,
      $.parameter_list,
      optional(seq('->', $.type)),
      $.block,
    ),

    flow_definition: $ => seq(
      'flow', $.identifier,
      $.parameter_list,
      optional(seq('->', $.type)),
      $.block,
    ),

    parameter_list: $ => seq(
      '(',
      optional(comma_sep($.parameter)),
      ')',
    ),

    parameter: $ => seq(
      $.identifier,
      optional(seq(':', $.type)),
    ),

    struct_definition: $ => seq(
      'struct', $.identifier,
      optional($.type_arguments),
      '{', optional(comma_sep($.field_declaration)), '}',
    ),

    field_declaration: $ => seq($.identifier, ':', $.type),

    enum_definition: $ => seq(
      'enum', $.identifier,
      optional($.type_arguments),
      '{', optional(comma_sep($.variant)), '}',
    ),

    variant: $ => seq(
      $.identifier,
      optional(seq('(', comma_sep($.type), ')')),
    ),

    interface_definition: $ => seq(
      'interface', $.identifier,
      optional($.type_arguments),
      '{', repeat($.method_signature), '}',
    ),

    method_signature: $ => seq(
      'fn', $.identifier, $.parameter_list, optional(seq('->', $.type)),
    ),

    impl_definition: $ => seq(
      'impl', $.type,
      optional(seq('for', $.type)),
      '{', repeat($.function_definition), '}',
    ),

    type_definition: $ => seq('type', $.identifier, '=', $.type),

    import_declaration: $ => seq(
      'import', $.identifier,
      optional(seq(':', $.identifier)),
    ),

    fileid_declaration: $ => seq('fileid', $.string),

    // ── Types ──
    type: $ => choice(
      choice('int', 'float', 'bool', 'string', 'char', 'unit', 'never', 'auto'),
      $.identifier,
      prec.left(1, seq($.type, '?')),
      seq('[', $.type, optional(seq(';', $.expression)), ']'),
      seq('(', comma_sep($.type), ')'),
      prec.right(2, seq('&', optional('mut'), $.type)),
      prec.left(0, seq($.type, '::', $.identifier)),
    ),

    type_arguments: $ => seq('[', comma_sep($.type), ']'),

    // ── Block & Statements ──
    block: $ => seq('{', repeat($._statement), '}'),

    _statement: $ => choice(
      $.let_declaration,
      $.assignment,
      $.return_statement,
      $.expression,
    ),

    let_declaration: $ => seq(
      choice(
        $.identifier,
        seq($.identifier, ',', $.identifier),
      ),
      choice(':=', seq(':', optional($.type), '=')),
      $.expression,
      optional(seq(',', $.expression)),
    ),

    assignment: $ => seq(
      $.expression, '=', $.expression,
    ),

    return_statement: $ => prec.right(seq('return', optional($.expression))),

    // ── Expressions ──
    expression: $ => choice(
      prec(2, $.binary_expression),
      prec(1, $.unary_expression),
      $.if_expression,
      $.match_expression,
      $.loop_expression,
      $.for_expression,
      $.call_expression,
      $.field_expression,
      $.index_expression,
      $.struct_literal,
      $.go_expression,
      $.await_expression,
      $.recv_expression,
      $.block,
      $.identifier,
      $.integer_literal,
      $.float_literal,
      $.string,
      $.char_literal,
      choice('true', 'false', 'unit', 'None'),
      $.tuple_expression,
      $.array_expression,
    ),

    if_expression: $ => seq(
      'if', $.expression, $.block,
      optional(seq('else', choice($.block, $.if_expression))),
    ),

    match_expression: $ => seq(
      'match', $.expression, '{', repeat($.match_arm), '}',
    ),

    match_arm: $ => seq($.pattern, '=>', $.expression),

    pattern: $ => choice($.identifier, '_', seq($.identifier, '(', comma_sep($.pattern), ')')),

    loop_expression: $ => seq('loop', $.block),

    for_expression: $ => seq('for', $.identifier, 'in', $.expression, $.block),

    // ── Postfix / prefix operators ──
    // These are split from expression to avoid ambiguities
    call_expression: $ => prec(3, seq(
      choice($.identifier, $.field_expression),
      '(', optional(comma_sep($.expression)), ')',
    )),

    field_expression: $ => prec(3, seq(
      $.expression, '.', $.identifier,
    )),

    index_expression: $ => prec(3, seq(
      $.expression, '[', $.expression, ']',
    )),

    struct_literal: $ => prec(3, seq(
      $.identifier, '{',
        optional(comma_sep(seq($.identifier, '=', $.expression))),
      '}',
    )),

    go_expression: $ => prec(5, seq('go', $.expression)),

    await_expression: $ => prec(5, seq('await', $.expression)),

    recv_expression: $ => prec(3, seq($.identifier, '.recv()')),

    tuple_expression: $ => seq(
      '(', comma_sep($.expression), optional(','), ')',
    ),

    array_expression: $ => seq('[', comma_sep($.expression), ']'),

    // ── Binary & Unary ──
    binary_expression: $ => choice(
      prec.left(1, seq($.expression, '+', $.expression)),
      prec.left(1, seq($.expression, '-', $.expression)),
      prec.left(2, seq($.expression, '*', $.expression)),
      prec.left(2, seq($.expression, '/', $.expression)),
      prec.left(2, seq($.expression, '%', $.expression)),
      prec.left(0, seq($.expression, '==', $.expression)),
      prec.left(0, seq($.expression, '!=', $.expression)),
      prec.left(0, seq($.expression, '<', $.expression)),
      prec.left(0, seq($.expression, '>', $.expression)),
      prec.left(0, seq($.expression, '<=', $.expression)),
      prec.left(0, seq($.expression, '>=', $.expression)),
      prec.left(-1, seq($.expression, '&&', $.expression)),
      prec.left(-2, seq($.expression, '||', $.expression)),
    ),

    unary_expression: $ => prec(4, seq(choice('-', '!', '&', '&mut'), $.expression)),

    // ── Primitives ──
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    integer_literal: $ => token(choice(
      /[0-9][0-9_]*/,
      seq('0x', /[0-9a-fA-F][0-9a-fA-F_]*/),
      seq('0o', /[0-7][0-7_]*/),
      seq('0b', /[01][01_]*/),
    )),

    float_literal: $ => token(seq(
      /[0-9][0-9_]*/, '.', /[0-9][0-9_]*/,
      optional(/[eE][+-]?[0-9]+/),
    )),

    string: $ => token(seq(
      '"', repeat(choice(/[^"\\]/, /\\./)), '"',
    )),

    char_literal: $ => token(seq(
      "'", choice(/[^'\\]/, /\\./), "'",
    )),
  },
});

function comma_sep(rule) {
  return optional(seq(
    rule,
    repeat(seq(',', rule)),
  ));
}
