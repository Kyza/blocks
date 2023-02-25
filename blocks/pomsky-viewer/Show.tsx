export default function Show(props: {
	when: boolean | any;
	children?: null | string | JSX.Element | JSX.Element[];
}) {
	return <>{props.when ? props.children : null}</>;
}
