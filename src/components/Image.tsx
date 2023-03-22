import { useEffect, useState } from "react";

import { useGlobalContext } from "../Context";

import './Image.css';

type ImageProps = {
	src: string;
	height: number;
	handleLoading: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
};

type ImageZoomProps = {
	src: string,
	handleClick: React.Dispatch<React.SetStateAction<boolean>>
}

const ImageZoom = ({src, handleClick}: ImageZoomProps) => {
	return (
		<div
			className='image-zoomed__container animation--fadein'
			onClick={() => handleClick(false)} >
				<div
					className='image-zoomed__image animation--zoomin'
					style={{backgroundImage: `url(${src})`}} />
		</div>
	);
}

const Image = ({ src, height, handleLoading }: ImageProps) => {

	const {globalState, globalDispatch} = useGlobalContext();
	const [zoom, setZoom] = useState(globalState.mode === 'zoom');

	const handdleClick = (e:React.MouseEvent<HTMLImageElement, MouseEvent>) => {
		setZoom(true);
		globalDispatch({
			type: 'update',
			payload: {
				mode: 'zoom'
			}
		})
	}

	useEffect(() => {
		if (globalState.mode !== 'zoom')
			setZoom(false);
	}, [globalState.mode])

	return (
		<>
			{
				zoom &&
				<ImageZoom
					src={ 'http://' + window.location.hostname + ':8000/' + src }
					handleClick={setZoom} />
			}
			<img
				className='configuration__image'
				alt=''
				height={height}
				onClick={handdleClick}
		//		src={ 'https://' + window.location.hostname + src }
				src={ 'http://' + window.location.hostname + ':8000/' + src }
				onLoad={handleLoading} />
		</>
	);

}

export default Image;