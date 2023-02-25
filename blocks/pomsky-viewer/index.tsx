import { FileBlockProps, getLanguageFromFilename } from "@githubnext/blocks";
import {
	ActionList,
	ActionMenu,
	Box,
	Button,
	ButtonGroup,
} from "@primer/react";
import "./index.css";

import initPomsky, { PomskyResult, compile } from "pomsky-wasm";
import { memo, useEffect, useState } from "react";
import pomskyWASM from "./pomsky-wasm.json";

export default memo(function (props: FileBlockProps) {
	const { context, content, metadata, onUpdateMetadata, BlockComponent } =
		props;
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

	useEffect(() => {
		if (didInit) setPomskyResult(compile(content, flavor.toLowerCase()));
	}, [didInit, content, flavor]);

	return (
		<Box
			position="relative"
			display="flex"
			flexDirection="column"
			width="100%"
			height="100%"
		>
			<Show when={isPomsky}>
				<Box
					borderColor="border.default"
					borderWidth={1}
					borderStyle="solid"
					overflow="hidden"
					borderTop="hidden"
					borderLeft="hidden"
					borderRight="hidden"
					p={2}
					bg="canvas.subtle"
					display="flex"
					minHeight={48}
				>
					<ButtonGroup sx={{ display: "flex", alignItems: "center" }}>
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
				</Box>
				<Show when={tab === "pomsky"}>
					<BlockComponent
						block={{
							owner: "githubnext",
							repo: "blocks-examples",
							id: "code-block",
						}}
					/>
				</Show>
				<Show when={tab === "regex"}>
					<Show when={didInit}>
						<pre>
							<code>
								<Show
									when={
										pomskyResult &&
										pomskyResult?.diagnostics.length > 0
									}
								>
									{JSON.stringify(
										pomskyResult?.diagnostics,
										null,
										"\t"
									)}
								</Show>
								<Show
									when={
										pomskyResult &&
										pomskyResult?.diagnostics.length === 0
									}
								>
									{pomskyResult?.output}
								</Show>
							</code>
						</pre>
					</Show>
					<Show when={!didInit}>
						<Box p={3}>Pomsky WASM is still initializing.</Box>
					</Show>
				</Show>
			</Show>
			<Show when={!isPomsky}>
				<Box p={3}>
					<code>{context.file}</code> is not Pomsky code.
					<br />
					This block only works on files ending with <code>
						.pom
					</code> or <code>.pomsky</code>.
				</Box>
			</Show>
		</Box>
	);
});

function Show(props: {
	when: boolean | any;
	children?: null | string | JSX.Element | JSX.Element[];
}) {
	return <>{props.when ? props.children : null}</>;
}
