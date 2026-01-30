import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

type GeneratorOptions = {
	totalWords: number;
	outputPath: string;
	metadataPath: string;
};

const DEFAULT_OUTPUT_DIR = join(__dirname, "..", "test-files");

const NUMBER_ARG_PATTERN = /^(?:--)?([a-zA-Z][\w-]*)=(.+)$/;

const parseArgs = (argv: string[]): GeneratorOptions => {
	const args = new Map<string, string>();

	for (const raw of argv) {
		const match = raw.match(NUMBER_ARG_PATTERN);
		if (!match) {
			continue;
		}

		args.set(match[1].toLowerCase(), match[2]);
	}

	const totalWords = Number(args.get("totalwords") ?? "");
	const outputName =
		args.get("output") ?? `generated-${totalWords}-words-${Date.now()}.txt`;
	const outputPath = join(DEFAULT_OUTPUT_DIR, outputName);
	const metadataPath = `${outputPath}.meta.json`;

	if (!Number.isFinite(totalWords) || totalWords <= 0) {
		throw new Error("totalWords must be a positive number.");
	}

	return {
		totalWords,
		outputPath,
		metadataPath,
	};
};

const randomInt = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const COMMON_WORDS = [
	"ability",
	"about",
	"above",
	"accept",
	"access",
	"across",
	"action",
	"active",
	"actual",
	"address",
	"advice",
	"affect",
	"after",
	"again",
	"against",
	"agency",
	"almost",
	"always",
	"amount",
	"animal",
	"answer",
	"anyone",
	"appear",
	"around",
	"arrive",
	"article",
	"artist",
	"attack",
	"author",
	"back",
	"bank",
	"beautiful",
	"because",
	"become",
	"before",
	"begin",
	"behind",
	"benefit",
	"between",
	"beyond",
	"billion",
	"brother",
	"build",
	"business",
	"camera",
	"capital",
	"career",
	"center",
	"chance",
	"change",
	"charge",
	"choose",
	"church",
	"citizen",
	"city",
	"class",
	"clear",
	"close",
	"coach",
	"college",
	"common",
	"company",
	"compare",
	"concern",
	"consider",
	"control",
	"cost",
	"country",
	"course",
	"cover",
	"create",
	"crime",
	"culture",
	"current",
	"customer",
	"data",
	"decision",
	"degree",
	"design",
	"detail",
	"develop",
	"different",
	"dinner",
	"doctor",
	"during",
	"early",
	"economic",
	"education",
	"effect",
	"effort",
	"eight",
	"either",
	"energy",
	"enough",
	"enter",
	"entire",
	"event",
	"example",
	"expect",
	"experience",
	"family",
	"father",
	"feature",
	"field",
	"figure",
	"final",
	"follow",
	"force",
	"foreign",
	"forward",
	"friend",
	"future",
	"garden",
	"general",
	"government",
	"ground",
	"growth",
	"happy",
	"health",
	"history",
	"home",
	"hospital",
	"hour",
	"house",
	"human",
	"idea",
	"image",
	"impact",
	"important",
	"include",
	"increase",
	"inside",
	"interest",
	"issue",
	"itself",
	"job",
	"knowledge",
	"language",
	"large",
	"later",
	"learn",
	"legal",
	"level",
	"light",
	"local",
	"long",
	"love",
	"major",
	"market",
	"matter",
	"media",
	"member",
	"message",
	"middle",
	"moment",
	"money",
	"month",
	"morning",
	"mother",
	"music",
	"nation",
	"nature",
	"near",
	"nearly",
	"need",
	"network",
	"night",
	"north",
	"number",
	"office",
	"often",
	"once",
	"order",
	"organization",
	"outside",
	"owner",
	"page",
	"paper",
	"parent",
	"party",
	"people",
	"period",
	"person",
	"picture",
	"place",
	"plan",
	"player",
	"point",
	"policy",
	"popular",
	"power",
	"prepare",
	"present",
	"press",
	"price",
	"private",
	"problem",
	"process",
	"produce",
	"product",
	"project",
	"public",
	"quality",
	"question",
	"quick",
	"radio",
	"raise",
	"range",
	"rate",
	"rather",
	"reach",
	"ready",
	"reason",
	"receive",
	"record",
	"reduce",
	"region",
	"remain",
	"remove",
	"report",
	"research",
	"resource",
	"result",
	"return",
	"right",
	"risk",
	"road",
	"role",
	"rule",
	"safe",
	"same",
	"save",
	"school",
	"science",
	"season",
	"second",
	"section",
	"security",
	"seek",
	"service",
	"seven",
	"share",
	"short",
	"should",
	"simple",
	"since",
	"skill",
	"small",
	"social",
	"society",
	"sound",
	"source",
	"south",
	"special",
	"specific",
	"state",
	"station",
	"store",
	"story",
	"strategy",
	"street",
	"strong",
	"student",
	"study",
	"style",
	"success",
	"system",
	"table",
	"teacher",
	"technology",
	"their",
	"theory",
	"there",
	"these",
	"thing",
	"think",
	"third",
	"those",
	"through",
	"today",
	"together",
	"toward",
	"training",
	"travel",
	"treat",
	"trial",
	"truth",
	"under",
	"unit",
	"until",
	"value",
	"view",
	"voice",
	"water",
	"week",
	"while",
	"white",
	"whole",
	"woman",
	"word",
	"work",
	"world",
	"write",
	"year",
	"young",
];

const generateWords = (options: GeneratorOptions): string[] => {
	const words: string[] = [];
	for (let i = 0; i < options.totalWords; i += 1) {
		const word = COMMON_WORDS[randomInt(0, COMMON_WORDS.length - 1)];
		words.push(word);
	}

	return words;
};

const writeFile = (options: GeneratorOptions, words: string[]): void => {
	mkdirSync(dirname(options.outputPath), { recursive: true });
	const contents = `${words.join(" ")}\n`;
	writeFileSync(options.outputPath, contents, { encoding: "utf-8" });
};

type WordStat = { word: string; count: number };

const buildStats = (words: string[]) => {
	const counts = new Map<string, number>();
	let totalLength = 0;

	for (const word of words) {
		counts.set(word, (counts.get(word) ?? 0) + 1);
		totalLength += word.length;
	}

	const uniqueWords = counts.size;
	const avgWordLength = words.length === 0 ? 0 : totalLength / words.length;
	const top10Words: WordStat[] = Array.from(counts.entries())
		.map(([word, count]) => ({ word, count }))
		.sort((a, b) => (b.count !== a.count ? b.count - a.count : a.word.localeCompare(b.word)))
		.slice(0, 10);

	return {
		totalWords: words.length,
		uniqueWords,
		avgWordLength: Number(avgWordLength.toFixed(2)),
		top10Words,
	};
};

const writeMetadata = (options: GeneratorOptions, words: string[]): void => {
	const stats = buildStats(words);
	writeFileSync(options.metadataPath, JSON.stringify(stats, null, 2), { encoding: "utf-8" });
};

const main = () => {
	try {
		const options = parseArgs(process.argv.slice(2));
		const words = generateWords(options);
		writeFile(options, words);
		writeMetadata(options, words);
		const avgLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

		// eslint-disable-next-line no-console
		console.log(`Generated ${words.length} words in ${options.outputPath}`);
		// eslint-disable-next-line no-console
		console.log(`Unique words: ${new Set(words).size}`);
		// eslint-disable-next-line no-console
		console.log(`Average word length: ${avgLength.toFixed(2)}`);
		// eslint-disable-next-line no-console
		console.log(`Metadata: ${options.metadataPath}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		// eslint-disable-next-line no-console
		console.error(`Error: ${message}`);
		// eslint-disable-next-line no-console
		console.error(
			"Usage: ts-node scripts/test-file-generator.ts --totalWords=1000 --output=sample.txt"
		);
		process.exit(1);
	}
};

main();
