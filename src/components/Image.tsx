import { useGlobalContext } from "../Context";

import './Image.css';

type ImageProps = {
	src: string;
	indexImage: number;
	indexConfiguration: number;
	height: number;
	handleLoading: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
};

const Image = ({ src, height, indexImage, indexConfiguration, handleLoading }: ImageProps) => {

	const globalDispatch = useGlobalContext().globalDispatch;

	const handleClick = (e:React.MouseEvent<HTMLImageElement, MouseEvent>) => {
		globalDispatch({
			type: 'update',
			payload: {
				mode: 'zoom',
				currentZoom: indexImage,
				currentConfiguration: indexConfiguration
			}
		})
	}

	return (
		<img
			className='configuration__image'
			alt=''
			height={height}
			onClick={handleClick}
	//		src={ 'https://' + window.location.hostname + src }
			src={ 'http://' + window.location.hostname + ':8000/' + src }
			onLoad={handleLoading} />
	);

}

export default Image;