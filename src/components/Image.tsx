import { memo, useEffect, useRef, useState } from 'react';
import { useGlobalContext } from "../Context";

import './Image.css';

type ImageProps = {
	src: string;
	indexImage: number;
	indexConfiguration: number;
	height: number;
	handleLoading: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
};

const Image = memo(({ src, height, indexImage, indexConfiguration, handleLoading }: ImageProps) => {

	const {globalState, globalDispatch} = useGlobalContext();
	const [isSelected, setIsSelected] = useState(false);
	const [fadeIn, setFadeIn] = useState(false);

	useEffect(() => {

		if (indexConfiguration !== globalState.currentConfiguration){
			setFadeIn(false);
			return ;
		}

		if (globalState.loaded === globalState.total){

			let timer:NodeJS.Timeout|null = setTimeout(() => {
				setFadeIn(true);
			}, (indexImage + 1) * 100);

			return () => {
				clearTimeout(timer!)
				timer = null;
			}
		}

	}, [globalState.currentConfiguration, globalState.loaded])

	const handleClick = (e:React.MouseEvent<HTMLImageElement, MouseEvent>) => {
		if (globalState.mode === 'selection'){
			if (isSelected){
				globalDispatch({
					type: 'pop',
					payload: {
						field: 'newConfiguration',
						item: src
					}
				})
			} else {
				globalDispatch({
					type: 'push',
					payload: {
						field: 'newConfiguration',
						item: src
					}
				})
			}
			setIsSelected(!isSelected);
			return ;
		}
		globalDispatch({
			type: 'update',
			payload: {
				mode: 'zoom',
				currentZoom: indexImage
			}
		})
	}

	useEffect(() => {
		if (globalState.mode !== 'selection')
			setIsSelected(false);
	}, [globalState.mode])

	return (
		<img
			className={
				'configuration__image'
				+ (fadeIn ? ' animation--fadein configuration__image--visible': '')
				+ (isSelected ? ' configuration__image--selected' : '')}
			alt=''
			height={height}
			onClick={handleClick}
	//		src={ 'https://' + window.location.hostname + src }
			src={ src }
			onLoad={handleLoading} />
	);

})

export default Image;