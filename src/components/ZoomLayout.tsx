import { useGlobalContext } from '../Context';
import './ZoomLayout.css';
import spinner from '../assets/spinner.svg';
import { useState } from 'react';

type ImageZoomProps = {
	src: string
}

const ZoomLayout = ({src}: ImageZoomProps) => {
	const filetype = src.substring(src.lastIndexOf('_') + 1, src.lastIndexOf('.'));
	const [videoReady, setVideoReady] = useState(false);
	const globalDispatch = useGlobalContext().globalDispatch;

	const handleClick = () => {
		globalDispatch({
			type: 'update',
			payload: {
				mode: 'default'
			}
		})
	}
	return (
		<div
			className='image-zoomed__container animation--fadein'
			style={{backgroundImage: `url(${spinner})`}}
			onClick={handleClick} >
				<div className='animation--zoomin' >
					{
					filetype === 'video' ?
					<video loop controls autoPlay
						onPlay={() => {setVideoReady(true)}}
						className={'image-zoomed__video' + (videoReady ? ' animation--fadein': '--hidden')}
						src={src.substring(0, src.lastIndexOf('_')) + '.mp4'} />
					: <div
						className='image-zoomed__image'
						style={{backgroundImage: `url(${src})`}} />
					}
				</div>
		</div>
	);
}

export default ZoomLayout;