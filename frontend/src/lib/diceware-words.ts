// EFF short word list #1 (a curated subset of ~256 words for browser bundle size).
// For production-grade entropy use a full 7776-word list; this is a usable demo.
export const WORDS: string[] = [
	"acid", "acorn", "acre", "action", "active", "actor", "actress", "ad",
	"adapt", "add", "admit", "adopt", "adult", "advance", "advice", "afford",
	"afraid", "after", "again", "age", "agency", "agenda", "agent", "ago",
	"agree", "ahead", "aid", "aide", "aim", "air", "airline", "airport",
	"alarm", "album", "alert", "alien", "all", "alley", "allow", "almost",
	"alone", "along", "alpha", "also", "alter", "always", "amazing", "among",
	"amount", "amused", "anchor", "ancient", "anger", "angle", "angry", "animal",
	"ankle", "annual", "answer", "ant", "any", "apart", "ape", "apple",
	"april", "area", "arena", "arm", "army", "arrest", "arrow", "art",
	"artist", "ash", "ask", "aspect", "asset", "atlas", "atom", "attack",
	"author", "auto", "autumn", "avenue", "avoid", "awake", "award", "aware",
	"away", "awful", "axis", "baby", "back", "bacon", "bad", "badge",
	"bag", "bake", "balance", "ball", "balloon", "bamboo", "ban", "banana",
	"band", "bank", "bar", "bare", "bargain", "barn", "barrel", "base",
	"basic", "basis", "basket", "battle", "beach", "bean", "bear", "beard",
	"beauty", "because", "become", "bee", "before", "begin", "behave", "behind",
	"belief", "belt", "bench", "bend", "berry", "best", "better", "beyond",
	"bicycle", "big", "bike", "bill", "bind", "bird", "birth", "biscuit",
	"bit", "bite", "bitter", "black", "blade", "blame", "blank", "blast",
	"blaze", "bleak", "bless", "blind", "blink", "block", "blood", "bloom",
	"blow", "blue", "board", "boat", "body", "boil", "bold", "bomb",
	"bone", "bonus", "book", "boost", "boot", "border", "born", "boss",
	"both", "bottle", "bottom", "bounce", "bound", "bow", "bowl", "box",
	"boy", "brace", "brain", "branch", "brass", "brave", "bread", "break",
	"breath", "breeze", "brew", "brick", "bridge", "brief", "bright", "bring",
	"broad", "broken", "broker", "bronze", "brown", "brush", "bubble", "buddy",
	"budget", "buffer", "build", "bulb", "bull", "bullet", "bunch", "burden",
	"burn", "burst", "bus", "bush", "busy", "butter", "button", "buy",
	"buzz", "cabin", "cable", "cactus", "cage", "cake", "calm", "camera",
	"camp", "canal", "candle", "canoe", "canopy", "cap", "captain", "car",
	"carbon", "card", "cargo", "carry", "case", "cash", "cast", "castle",
	"catch", "cause", "ceiling", "celery", "center", "century", "cereal", "chain"
];

export function diceRollIndex(): number {
	const max = WORDS.length;
	const limit = Math.floor(0x100000000 / max) * max;
	const buf = new Uint32Array(1);
	let v: number;
	do {
		crypto.getRandomValues(buf);
		v = buf[0];
	} while (v >= limit);
	return v % max;
}
