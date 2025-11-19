import ply.lex as lex

reserved = {
    'int': 'INT_TYPE',
    'char': 'CHAR_TYPE',
    'float': 'FLOAT_TYPE',
    'double': 'DOUBLE_TYPE',
    'public': 'PUBLIC',
    'if': 'IF',
    'else': 'ELSE',
    'while': 'WHILE'
}

tokens = [
    'ID', 'NUMBER', 'EQUAL', 'PLUS', 'MINUS', 'TIMES', 'DIVIDE',
    'GT', 'LT', 'LPAREN', 'RPAREN', 'LBRACE', 'RBRACE',
    'COMMA', 'SEMICOLON'
] + list(reserved.values())

t_EQUAL     = r'='
t_PLUS      = r'\+'
t_MINUS     = r'-'
t_TIMES     = r'\*'
t_DIVIDE    = r'/'
t_GT        = r'>'
t_LT        = r'<'
t_LPAREN    = r'\('
t_RPAREN    = r'\)'
t_LBRACE    = r'\{'
t_RBRACE    = r'\}'
t_COMMA     = r','
t_SEMICOLON = r';'

def t_ID(t):
    r'[a-zA-Z_][a-zA-Z_0-9]*'
    t.type = reserved.get(t.value, 'ID')
    return t

def t_NUMBER(t):
    r'\d+'
    t.value = int(t.value)
    return t

t_ignore = ' \t\n'

def t_error(t):
    print(f"Illegal character '{t.value[0]}'")
    t.lexer.skip(1)

lexer = lex.lex()