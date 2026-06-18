/// <reference types="tree-sitter-cli/dsl" />
// TS-Checks: false

module.exports = grammar({
  name: 'core',

  extras: $ => [/\s/, $.comment],

  conflicts: $ => [
    [$.type, $.expression],
    [$.qualified_name, $.expression],
  ],

  rules: {
    source_file: $ => repeat($._definition),

    // ── Comments ──
    comment: $ => token(choice(
      seq('//', /[^\n]*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/'),
    )),

    // ── Definitions (top-level) ──
    _definition: $ => choice(
      $.function_definition,
      $.flow_definition,
      $.struct_definition,
      $.enum_definition,
      $.interface_definition,
      $.impl_definition,
      $.type_definition,
      $.import_declaration,
      $.fileid_declaration,
      $.const_definition,
    ),

    function_definition: $ => seq(
      'fn', $.identifier,
      $.parameter_list,
      optional(seq('->', $.type)),
      choice($.block, seq('=', $.expression)),
    ),

    flow_definition: $ => seq(
      'flow', $.identifier,
      $.parameter_list,
      optional(seq('->', $.type)),
      $.block,
    ),

    parameter_list: $ => seq(
      '(',
      optional(seq(
        $.parameter,
        repeat(seq(',', $.parameter)),
        optional(','),
      )),
      ')',
    ),

    parameter: $ => seq(
      $.identifier,
      optional(seq(':', $.type)),
    ),

    struct_definition: $ => seq(
      'struct', $.identifier,
      optional(seq('[', $.type_parameter_list, ']')),
      '{',
      optional(seq(
        $.field_declaration,
        repeat(seq(',', $.field_declaration)),
        optional(','),
      )),
      '}',
    ),

    field_declaration: $ => seq(
      $.identifier, ':', $.type,
    ),

    enum_definition: $ => seq(
      'enum', $.identifier,
      optional(seq('[', $.type_parameter_list, ']')),
      '{',
      optional(seq(
        $.variant_declaration,
        repeat(seq(',', $.variant_declaration)),
        optional(','),
      )),
      '}',
    ),

    variant_declaration: $ => seq(
      $.identifier,
      optional(seq('(', comma_sep($.type), ')')),
    ),

    interface_definition: $ => seq(
      'interface', $.identifier,
      optional(seq('[', $.type_parameter_list, ']')),
      '{',
        repeat($.method_signature),
      '}',
    ),

    method_signature: $ => seq(
      'fn', $.identifier, $.parameter_list,
      optional(seq('->', $.type)),
    ),

    impl_definition: $ => seq(
      'impl',
      choice($.type, seq('for', $.type)),
      '{', repeat($.function_definition), '}',
    ),

    type_definition: $ => seq(
      'type', $.identifier, '=', $.type,
    ),

    import_declaration: $ => seq(
      'import', $.identifier,
      optional(seq(':', $.identifier)),
    ),

    fileid_declaration: $ => seq(
      'fileid', $.string,
    ),

    const_definition: $ => seq(
      $.identifier, ':', $.type, '=', $.expression,
    ),

    // ── Types ──
    type: $ => choice(
      'int', 'float', 'bool', 'string', 'char', 'unit', 'never',
      $.identifier,
      seq($.type, '?'),
      seq('[', $.type, ']'),
      seq('[', $.type, ';', $.expression, ']'),
      seq('(', comma_sep($.type), ')'),
      seq('&', optional('mut'), $.type),
      seq('fn', '(', comma_sep($.type), ')', optional(seq('->', $.type))),
      seq($.type, '::', $.identifier),
    ),

    // ── Statements ──
    _statement: $ => choice(
      $.let_declaration,
      $.assignment,
      $.if_expression,
      $.match_expression,
      $.loop_statement,
      $.for_statement,
      $.while_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.go_expression,
      $.yield_statement,
      $.recv_expression,
      $.unsafe_block,
      $.expression_statement,
    ),

    let_declaration: $ => seq(
      choice(
        seq($.identifier, ':=', $.expression),
        seq($.identifier, ':', optional($.type), '=', $.expression),
        seq($.identifier, ',', $.identifier, ':', optional($.type), '=', $.expression, ',', $.expression),
      ),
    ),

    assignment: $ => seq(
      $.expression, '=', $.expression,
    ),

    block: $ => seq(
      '{', repeat($._statement), '}',
    ),

    if_expression: $ => seq(
      'if', $.expression, $.block,
      optional(seq('else', choice($.block, $.if_expression))),
    ),

    match_expression: $ => seq(
      'match', $.expression, '{',
        repeat($.match_arm),
      '}',
    ),

    match_arm: $ => seq(
      choice($.pattern, '_'), '=>', $.expression,
    ),

    pattern: $ => choice(
      $.identifier,
      $.qualified_name,
      seq($.identifier, '(', comma_sep($.pattern), ')'),
    ),

    loop_statement: $ => seq('loop', $.block),

    for_statement: $ => seq(
      'for', $.identifier, 'in', $.expression, $.block,
    ),

    while_statement: $ => seq(
      'while', $.expression, $.block,
    ),

    return_statement: $ => seq('return', optional($.expression)),

    break_statement: $ => seq('break', optional($.expression)),

    continue_statement: $ => seq('continue'),

    yield_statement: $ => seq('yield', optional($.expression)),

    unsafe_block: $ => seq('unsafe', $.block),

    // ── Expressions ──
    expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.field_expression,
      $.index_expression,
      $.reference_expression,
      $.cast_expression,
      $.struct_literal,
      $.enum_constructor,
      $.tuple_expression,
      $.array_expression,
      $.range_expression,
      $.go_expression,
      $.await_expression,
      $.recv_expression,
      $.if_expression,
      $.block,
      $.identifier,
      $.qualified_name,
      $.integer_literal,
      $.float_literal,
      $.string,
      $.char_literal,
      $.bool_literal,
      $.unit_literal,
      $.none_literal,
      $.paren_expression,
    ),

    paren_expression: $ => seq('(', $.expression, ')'),

    binary_expression: $ => choice(
      ...[
        ['+', 1], ['-', 1], ['*', 2], ['/', 2], ['%', 2],
        ['==', 0], ['!=', 0], ['<', 0], ['>', 0], ['<=', 0], ['>=', 0],
        ['&&', -1], ['||', -1],
      ].map(([op, prec]) =>
        prec(PREC[op], seq($.expression, op, $.expression))
      ),
    ),

    unary_expression: $ => prec(3, seq(choice('-', '!'), $.expression)),

    call_expression: $ => seq(
      $.expression,
      '(',
        optional(comma_sep($.expression)),
      ')',
    ),

    field_expression: $ => seq($.expression, '.', $.identifier),

    index_expression: $ => seq($.expression, '[', $.expression, ']'),

    reference_expression: $ => prec(3, seq('&', optional('mut'), $.expression)),

    cast_expression: $ => seq($.expression, 'as', $.type),

    struct_literal: $ => seq(
      $.identifier, '{',
        optional(seq(
          $.identifier, '=', $.expression,
          repeat(seq(',', $.identifier, '=', $.expression)),
          optional(','),
        )),
      '}',
    ),

    enum_constructor: $ => seq(
      $.identifier, '(', comma_sep($.expression), ')',
    ),

    tuple_expression: $ => seq(
      '(', comma_sep($.expression), optional(',') ,')',
    ),

    array_expression: $ => seq(
      '[', comma_sep($.expression), ']',
    ),

    range_expression: $ => seq($.expression, '..', $.expression),

    go_expression: $ => seq('go', $.expression),

    await_expression: $ => seq('await', $.expression),

    recv_expression: $ => seq($.identifier, '.recv()'),

    expression_statement: $ => $.expression,

    // ── Primitives ──
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    qualified_name: $ => seq($.identifier, '::', $.identifier),

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
      '"',
      repeat(choice(
        /[^"\\]/,
        /\\./,
      )),
      '"',
    )),

    char_literal: $ => token(seq(
      '\'',
      choice(/[^'\\]/, /\\./),
      '\'',
    )),

    bool_literal: $ => choice('true', 'false'),

    unit_literal: $ => '()',

    none_literal: $ => 'None',
  },
});

const PREC = {
  '||': -1,
  '&&': 0,
  '==': 0, '!=': 0, '<': 0, '>': 0, '<=': 0, '>=': 0,
  '+': 1, '-': 1,
  '*': 2, '/': 2, '%': 2,
};

function comma_sep(rule) {
  return optional(seq(
    rule,
    repeat(seq(',', rule)),
  ));
}
