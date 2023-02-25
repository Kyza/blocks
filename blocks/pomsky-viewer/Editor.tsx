import { Box } from "@primer/react";
import "./index.css";

import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";

let savedState: EditorState;

export default (function (props: {
	text: string;
	onChange: (text: string) => void;
}) {
	let editor: EditorView;

	return (
		<Box
			className="content"
			ref={(element) => {
				editor?.destroy();
				editor ??= new EditorView({
					doc: props.text,
					state: savedState,
					extensions: [
						basicSetup,
						keymap.of([
							// @ts-ignore
							indentWithTab,
						]),
						javascript({ typescript: true }),
						EditorView.updateListener.of((update) => {
							if (update.changes.empty) return;
							savedState = update.state;
							props.onChange(update.state.doc.toString());
						}),
					],
					parent: element!,
				});
			}}
		></Box>
	);
});
