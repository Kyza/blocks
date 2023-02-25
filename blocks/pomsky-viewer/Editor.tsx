import { Box } from "@primer/react";
import "./index.css";

import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { memo } from "react";

let savedStates: Record<PropertyKey, EditorState> = {};

export default memo(function (props: {
	id: PropertyKey;
	text: string;
	lineWrapping?: boolean;
	readOnly?: boolean;
	onChange?: (text: string) => void;
}) {
	let editor: EditorView;

	return (
		<Box
			className="content"
			ref={(element) => {
				editor?.destroy();
				editor ??= new EditorView({
					doc: props.text,
					state: savedStates[props.id],
					extensions: [
						basicSetup,
						keymap.of([
							// @ts-ignore
							indentWithTab,
						]),
						javascript({ typescript: true }),
						EditorState.readOnly.of(props.readOnly ?? false),
						[
							props.lineWrapping ? EditorView.lineWrapping : null,
						].filter((i) => i != null) as any,
						EditorView.updateListener.of((update) => {
							if (update.changes.empty) return;
							savedStates[props.id] = update.state;
							props.onChange?.(update.state.doc.toString());
						}),
					],
					parent: element!,
				});

				// Ensure focus.
				editor.focus();
			}}
		></Box>
	);
});
