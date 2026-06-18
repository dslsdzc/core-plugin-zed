package tree_sitter_core_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-core"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_core.Language())
	if language == nil {
		t.Errorf("Error loading Core grammar")
	}
}
