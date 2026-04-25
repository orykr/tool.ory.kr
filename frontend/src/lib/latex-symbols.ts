export interface LatexSymbol {
	command: string;
	rendered: string;
	keywords: string[];
	category: string;
}

export const LATEX_SYMBOLS: LatexSymbol[] = [
	// Greek lowercase
	{ command: "\\alpha", rendered: "α", keywords: ["alpha"], category: "Greek" },
	{ command: "\\beta", rendered: "β", keywords: ["beta"], category: "Greek" },
	{ command: "\\gamma", rendered: "γ", keywords: ["gamma"], category: "Greek" },
	{ command: "\\delta", rendered: "δ", keywords: ["delta"], category: "Greek" },
	{ command: "\\epsilon", rendered: "ϵ", keywords: ["epsilon"], category: "Greek" },
	{ command: "\\varepsilon", rendered: "ε", keywords: ["epsilon", "var"], category: "Greek" },
	{ command: "\\zeta", rendered: "ζ", keywords: ["zeta"], category: "Greek" },
	{ command: "\\eta", rendered: "η", keywords: ["eta"], category: "Greek" },
	{ command: "\\theta", rendered: "θ", keywords: ["theta"], category: "Greek" },
	{ command: "\\vartheta", rendered: "ϑ", keywords: ["theta", "var"], category: "Greek" },
	{ command: "\\iota", rendered: "ι", keywords: ["iota"], category: "Greek" },
	{ command: "\\kappa", rendered: "κ", keywords: ["kappa"], category: "Greek" },
	{ command: "\\lambda", rendered: "λ", keywords: ["lambda"], category: "Greek" },
	{ command: "\\mu", rendered: "μ", keywords: ["mu"], category: "Greek" },
	{ command: "\\nu", rendered: "ν", keywords: ["nu"], category: "Greek" },
	{ command: "\\xi", rendered: "ξ", keywords: ["xi"], category: "Greek" },
	{ command: "\\pi", rendered: "π", keywords: ["pi"], category: "Greek" },
	{ command: "\\varpi", rendered: "ϖ", keywords: ["pi", "var"], category: "Greek" },
	{ command: "\\rho", rendered: "ρ", keywords: ["rho"], category: "Greek" },
	{ command: "\\sigma", rendered: "σ", keywords: ["sigma"], category: "Greek" },
	{ command: "\\tau", rendered: "τ", keywords: ["tau"], category: "Greek" },
	{ command: "\\upsilon", rendered: "υ", keywords: ["upsilon"], category: "Greek" },
	{ command: "\\phi", rendered: "ϕ", keywords: ["phi"], category: "Greek" },
	{ command: "\\varphi", rendered: "φ", keywords: ["phi", "var"], category: "Greek" },
	{ command: "\\chi", rendered: "χ", keywords: ["chi"], category: "Greek" },
	{ command: "\\psi", rendered: "ψ", keywords: ["psi"], category: "Greek" },
	{ command: "\\omega", rendered: "ω", keywords: ["omega"], category: "Greek" },

	// Greek uppercase
	{ command: "\\Gamma", rendered: "Γ", keywords: ["gamma", "uppercase"], category: "Greek" },
	{ command: "\\Delta", rendered: "Δ", keywords: ["delta", "uppercase"], category: "Greek" },
	{ command: "\\Theta", rendered: "Θ", keywords: ["theta", "uppercase"], category: "Greek" },
	{ command: "\\Lambda", rendered: "Λ", keywords: ["lambda", "uppercase"], category: "Greek" },
	{ command: "\\Xi", rendered: "Ξ", keywords: ["xi", "uppercase"], category: "Greek" },
	{ command: "\\Pi", rendered: "Π", keywords: ["pi", "uppercase", "product"], category: "Greek" },
	{ command: "\\Sigma", rendered: "Σ", keywords: ["sigma", "uppercase", "sum"], category: "Greek" },
	{ command: "\\Phi", rendered: "Φ", keywords: ["phi", "uppercase"], category: "Greek" },
	{ command: "\\Psi", rendered: "Ψ", keywords: ["psi", "uppercase"], category: "Greek" },
	{ command: "\\Omega", rendered: "Ω", keywords: ["omega", "uppercase", "ohm"], category: "Greek" },

	// Operators
	{ command: "\\pm", rendered: "±", keywords: ["plus", "minus"], category: "Operator" },
	{ command: "\\mp", rendered: "∓", keywords: ["minus", "plus"], category: "Operator" },
	{ command: "\\times", rendered: "×", keywords: ["times", "multiply"], category: "Operator" },
	{ command: "\\div", rendered: "÷", keywords: ["divide"], category: "Operator" },
	{ command: "\\cdot", rendered: "⋅", keywords: ["dot", "multiply"], category: "Operator" },
	{ command: "\\ast", rendered: "∗", keywords: ["asterisk", "star"], category: "Operator" },
	{ command: "\\star", rendered: "⋆", keywords: ["star"], category: "Operator" },
	{ command: "\\circ", rendered: "∘", keywords: ["circle", "compose"], category: "Operator" },
	{ command: "\\bullet", rendered: "•", keywords: ["bullet"], category: "Operator" },
	{ command: "\\oplus", rendered: "⊕", keywords: ["plus", "circle", "xor"], category: "Operator" },
	{ command: "\\otimes", rendered: "⊗", keywords: ["times", "circle"], category: "Operator" },

	// Relations
	{ command: "\\le", rendered: "≤", keywords: ["less", "equal"], category: "Relation" },
	{ command: "\\ge", rendered: "≥", keywords: ["greater", "equal"], category: "Relation" },
	{ command: "\\neq", rendered: "≠", keywords: ["not", "equal"], category: "Relation" },
	{ command: "\\approx", rendered: "≈", keywords: ["approx", "wave"], category: "Relation" },
	{ command: "\\equiv", rendered: "≡", keywords: ["equivalent"], category: "Relation" },
	{ command: "\\sim", rendered: "∼", keywords: ["similar", "tilde"], category: "Relation" },
	{ command: "\\propto", rendered: "∝", keywords: ["proportional"], category: "Relation" },
	{ command: "\\subset", rendered: "⊂", keywords: ["subset"], category: "Relation" },
	{ command: "\\supset", rendered: "⊃", keywords: ["superset"], category: "Relation" },
	{ command: "\\subseteq", rendered: "⊆", keywords: ["subset", "equal"], category: "Relation" },
	{ command: "\\supseteq", rendered: "⊇", keywords: ["superset", "equal"], category: "Relation" },
	{ command: "\\in", rendered: "∈", keywords: ["element", "in"], category: "Relation" },
	{ command: "\\notin", rendered: "∉", keywords: ["not", "element"], category: "Relation" },

	// Sets / logic
	{ command: "\\cup", rendered: "∪", keywords: ["union"], category: "Set" },
	{ command: "\\cap", rendered: "∩", keywords: ["intersection"], category: "Set" },
	{ command: "\\emptyset", rendered: "∅", keywords: ["empty", "set"], category: "Set" },
	{ command: "\\forall", rendered: "∀", keywords: ["for all"], category: "Logic" },
	{ command: "\\exists", rendered: "∃", keywords: ["exists"], category: "Logic" },
	{ command: "\\nexists", rendered: "∄", keywords: ["not", "exists"], category: "Logic" },
	{ command: "\\neg", rendered: "¬", keywords: ["not", "negation"], category: "Logic" },
	{ command: "\\land", rendered: "∧", keywords: ["and"], category: "Logic" },
	{ command: "\\lor", rendered: "∨", keywords: ["or"], category: "Logic" },
	{ command: "\\implies", rendered: "⟹", keywords: ["implies"], category: "Logic" },
	{ command: "\\iff", rendered: "⟺", keywords: ["if", "only", "iff"], category: "Logic" },

	// Calculus
	{ command: "\\sum", rendered: "∑", keywords: ["sum"], category: "Calculus" },
	{ command: "\\prod", rendered: "∏", keywords: ["product"], category: "Calculus" },
	{ command: "\\int", rendered: "∫", keywords: ["integral"], category: "Calculus" },
	{ command: "\\oint", rendered: "∮", keywords: ["integral", "loop"], category: "Calculus" },
	{ command: "\\partial", rendered: "∂", keywords: ["partial", "derivative"], category: "Calculus" },
	{ command: "\\nabla", rendered: "∇", keywords: ["nabla", "del"], category: "Calculus" },
	{ command: "\\infty", rendered: "∞", keywords: ["infinity"], category: "Calculus" },
	{ command: "\\lim", rendered: "lim", keywords: ["limit"], category: "Calculus" },

	// Arrows
	{ command: "\\leftarrow", rendered: "←", keywords: ["left", "arrow"], category: "Arrow" },
	{ command: "\\rightarrow", rendered: "→", keywords: ["right", "arrow", "to"], category: "Arrow" },
	{ command: "\\leftrightarrow", rendered: "↔", keywords: ["arrow"], category: "Arrow" },
	{ command: "\\uparrow", rendered: "↑", keywords: ["up", "arrow"], category: "Arrow" },
	{ command: "\\downarrow", rendered: "↓", keywords: ["down", "arrow"], category: "Arrow" },
	{ command: "\\Rightarrow", rendered: "⇒", keywords: ["double", "arrow", "implies"], category: "Arrow" },
	{ command: "\\Leftrightarrow", rendered: "⇔", keywords: ["double", "arrow"], category: "Arrow" },
	{ command: "\\mapsto", rendered: "↦", keywords: ["maps", "to"], category: "Arrow" },

	// Misc
	{ command: "\\sqrt{x}", rendered: "√x", keywords: ["sqrt", "root"], category: "Misc" },
	{ command: "\\frac{a}{b}", rendered: "a/b", keywords: ["fraction"], category: "Misc" },
	{ command: "\\hat{x}", rendered: "x̂", keywords: ["hat"], category: "Misc" },
	{ command: "\\bar{x}", rendered: "x̄", keywords: ["bar", "average"], category: "Misc" },
	{ command: "\\vec{x}", rendered: "x⃗", keywords: ["vector"], category: "Misc" },
	{ command: "\\dot{x}", rendered: "ẋ", keywords: ["dot", "derivative"], category: "Misc" },
	{ command: "\\ddot{x}", rendered: "ẍ", keywords: ["ddot"], category: "Misc" },
	{ command: "\\angle", rendered: "∠", keywords: ["angle"], category: "Misc" },
	{ command: "\\degree", rendered: "°", keywords: ["degree"], category: "Misc" },
	{ command: "\\therefore", rendered: "∴", keywords: ["therefore"], category: "Misc" },
	{ command: "\\because", rendered: "∵", keywords: ["because"], category: "Misc" },
	{ command: "\\square", rendered: "□", keywords: ["square", "qed"], category: "Misc" },
	{ command: "\\blacksquare", rendered: "■", keywords: ["square", "qed", "filled"], category: "Misc" }
];
