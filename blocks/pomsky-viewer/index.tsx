import { FileBlockProps, getLanguageFromFilename } from "@githubnext/blocks";
import {
	ActionList,
	ActionMenu,
	Box,
	Button,
	ButtonGroup,
	Flash,
} from "@primer/react";
import "./index.css";

import initPomsky, { PomskyResult, compile } from "pomsky-wasm";
import { memo, useEffect, useState } from "react";
import pomskyWASM from "./pomsky-wasm.json";

import Editor from "./Editor";
import Show from "./Show";

function findRowColContext(str: string, start: number) {
	const previousLines = str.slice(0, start).split("\n");
	const row = previousLines.length;
	const column = (previousLines[previousLines.length - 1] ?? "").length + 1;
	const context = str.split("\n")[previousLines.length];

	return { row, column, context };
}

export default memo(function (props: FileBlockProps) {
	const {
		context,
		content,
		metadata,
		onUpdateMetadata,
		onUpdateContent,
		BlockComponent,
		isEditable,
		originalContent,
	} = props;
	const language = Boolean(context.path)
		? getLanguageFromFilename(context.path)
		: "N/A";

	const [didInit, setDidInit] = useState(false);
	(async () => {
		if (!didInit) {
			initPomsky(Uint8Array.from(pomskyWASM)).then(() => {
				console.debug("[Pomsky Viewer] Initialized WASM.");
				setDidInit(true);
			});
		}
	})();

	const [isPomsky, setIsPomsky] = useState(false);
	useEffect(() => {
		setIsPomsky(
			context.path.endsWith(".pom") || context.path.endsWith(".pomsky")
		);
	}, [context]);

	const [tab, setTab] = useState<"pomsky" | "regex">("pomsky");

	const [flavor, setFlavor] = useState<
		"JavaScript" | "Java" | ".NET" | "PCRE" | "Python" | "Ruby" | "Rust"
	>("JavaScript");

	const [pomskyResult, setPomskyResult] = useState<PomskyResult | null>();
	const [didError, setDidError] = useState(false);
	useEffect(() => {
		if (didInit) {
			const result = compile(content, flavor.toLowerCase());
			console.debug(result);
			setPomskyResult(result);
			setDidError(result?.output == null);
		}
	}, [didInit, content, flavor]);

	return (
		<Box className="pomsky-viewer">
			<Show when={isPomsky}>
				<Box
					className="header"
					borderColor="border.default"
					borderWidth={1}
					borderStyle="solid"
					overflow="hidden"
					borderTop="hidden"
					borderLeft="hidden"
					borderRight="hidden"
					p={2}
					bg="canvas.subtle"
				>
					<ButtonGroup>
						<Button
							onClick={() => setTab("pomsky")}
							disabled={tab === "pomsky"}
						>
							Pomsky
						</Button>
						<Button
							onClick={() => setTab("regex")}
							disabled={tab === "regex"}
						>
							RegEx
						</Button>
					</ButtonGroup>
					<ActionMenu>
						<ActionMenu.Button className="flavor-button">
							{flavor}
						</ActionMenu.Button>

						<ActionMenu.Overlay>
							<ActionList>
								<ActionList.Group
									title="Flavor..."
									selectionVariant="single"
								>
									<ActionList.Item
										selected={flavor === "JavaScript"}
										onClick={() => setFlavor("JavaScript")}
									>
										JavaScript
									</ActionList.Item>
									<ActionList.Item
										selected={flavor === "Java"}
										onClick={() => setFlavor("Java")}
									>
										Java
									</ActionList.Item>
									<ActionList.Item
										selected={flavor === ".NET"}
										onClick={() => setFlavor(".NET")}
									>
										.NET
									</ActionList.Item>
									<ActionList.Item
										selected={flavor === "PCRE"}
										onClick={() => setFlavor("PCRE")}
									>
										PCRE
									</ActionList.Item>
									<ActionList.Item
										selected={flavor === "Python"}
										onClick={() => setFlavor("Python")}
									>
										Python
									</ActionList.Item>
									<ActionList.Item
										selected={flavor === "Ruby"}
										onClick={() => setFlavor("Ruby")}
									>
										Ruby
									</ActionList.Item>
									<ActionList.Item
										selected={flavor === "Rust"}
										onClick={() => setFlavor("Rust")}
									>
										Rust
									</ActionList.Item>
								</ActionList.Group>
							</ActionList>
						</ActionMenu.Overlay>
					</ActionMenu>
					<Show when={didError}>Error!</Show>
				</Box>
				<Show when={tab === "pomsky"}>
					<Editor
						text={originalContent}
						onChange={(text) => {
							onUpdateContent(text);
						}}
					/>
				</Show>
				<Show when={tab === "regex"}>
					<Show when={didInit}>
						<pre className="content">
							<code>
								<Show when={didError}>
									<Box p={3}>
										<Flash variant="danger">
											{JSON.stringify(
												pomskyResult?.diagnostics,
												null,
												"\t"
											)}
										</Flash>
									</Box>
								</Show>
								<Show when={!didError}>{pomskyResult?.output}</Show>
							</code>
						</pre>
					</Show>
					<Show when={!didInit}>
						<Box p={3}>
							<Flash variant="warning">
								Pomsky WASM is still initializing.
							</Flash>
						</Box>
					</Show>
				</Show>
			</Show>
			<Show when={!isPomsky}>
				<Box p={3}>
					<Flash variant="danger">
						<code>{context.file}</code> is not Pomsky code.
						<br />
						This block only works on files ending with <code>
							.pom
						</code>{" "}
						or <code>.pomsky</code>.
					</Flash>
				</Box>
			</Show>
		</Box>
	);
});
