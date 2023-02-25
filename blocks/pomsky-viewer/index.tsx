import { FileBlockProps, getLanguageFromFilename } from "@githubnext/blocks";
import { Box, Button, ButtonGroup } from "@primer/react";
import "./index.css";

import initPomsky, { compile } from "pomsky-wasm";
import pomskyWASM from "pomsky-wasm/pomsky_wasm_bg.wasm?url";
import { useEffect, useState } from "react";

export default function (props: FileBlockProps) {
	const { context, content, metadata, onUpdateMetadata, BlockComponent } =
		props;
	const language = Boolean(context.path)
		? getLanguageFromFilename(context.path)
		: "N/A";

	const [didInit, setDidInit] = useState(false);
	if (!didInit) {
		initPomsky(pomskyWASM).then(() => {
			setDidInit(true);
		});
	}

	const [isPomsky, setIsPomsky] = useState(false);
	useEffect(() => {
		setIsPomsky(
			context.path.endsWith(".pom") || context.path.endsWith(".pomsky")
		);
	}, [context]);

	const [tab, setTab] = useState<"pomsky" | "regex">("pomsky");

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
				</Box>
				<Show when={tab === "pomsky"}>
					<BlockComponent
						block={{
							owner: "githubnext",
							repo: "blocks-examples",
							id: "code-block",
						}}
						context={context}
					/>
				</Show>
				<Show when={tab === "regex"}>
					<Show when={didInit}>
						<pre>
							<code>
								{didInit ? compile(content, "js").output : null}
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
}

function Show(props: {
	when: boolean;
	children?: JSX.Element | JSX.Element[];
}) {
	return <>{props.when ? props.children : null}</>;
}
