import { useHeightContext, useDataContext } from "../context";

type ImageProps = {src: string};

const Image = ({src}: ImageProps) => {

	const dispatch = useDataContext().dispatch;

	const height = useHeightContext();

	return (
		<img
			alt=''
			height={ height }
			src={ 'https://' + window.location.hostname + src }
			onLoad={ () => dispatch({ type: 'imageLoaded' }) } />
	);

}

export default Image;