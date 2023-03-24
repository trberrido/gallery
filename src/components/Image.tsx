import { memo, useEffect, useRef, useState } from 'react';
import { useGlobalContext } from "../Context";

import './Image.css';

type ImageProps = {
	src: string;
	indexImage: number;
	indexConfiguration: number;
	height: number;
	highLight: number;
	setHighLight: React.Dispatch<React.SetStateAction<number>>;
	handleLoading: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
};

type State = 'selected' | 'faded' | 'default';

const Image = memo(({ src, height, indexImage, indexConfiguration, highLight, setHighLight, handleLoading }: ImageProps) => {

	const refImage = useRef<HTMLImageElement | null>(null);
	const {globalState, globalDispatch} = useGlobalContext();
	const [fadeIn, setFadeIn] = useState(false);
	const [state, setState] = useState<State>('default');
	const refTimer = useRef<NodeJS.Timeout>();

	useEffect(() => {

		if (indexConfiguration !== globalState.currentConfiguration){
			setFadeIn(false);
			return ;
		}

		if (globalState.loaded === globalState.total){

			const timer:NodeJS.Timeout = setTimeout(() => {
				setFadeIn(true);
			}, (indexImage + 1) * 100);
			refTimer.current = timer;

			return () => clearTimeout(refTimer.current)
		}

	}, [globalState.currentConfiguration, globalState.loaded])

	const handleClick = (e:React.MouseEvent<HTMLImageElement, MouseEvent>) => {

		if (globalState.mode === 'aligned')
		{
			setHighLight(e.currentTarget.getBoundingClientRect().top);
			return ;
		}

		if (globalState.mode === 'selection'){
			if (state === 'selected'){
				globalDispatch({
					type: 'pop',
					payload: {
						field: 'newConfiguration',
						item: src
					}
				})
			}
			if (state === 'default') {
				globalDispatch({
					type: 'push',
					payload: {
						field: 'newConfiguration',
						item: src
					}
				})
			}
			setState(state === 'selected' ? 'default' : 'selected');
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
		if (globalState.currentConfiguration === indexConfiguration ){
			if (highLight > 0){
				if (refImage.current && refImage.current.getBoundingClientRect().top !== highLight){
					setState('faded');
					return;
				}
			}
		}
		setState('default')
	}, [highLight])

	useEffect(() => {
		if (globalState.mode === 'default' || globalState.mode === 'mixin')
			setState('default');
	}, [globalState.mode])

	return (
		<img
			ref={refImage}
			className={
				'configuration__image'
				+ (fadeIn ? ' animation--fadein configuration__image--visible': '')
				+ (state === 'selected' ? ' configuration__image--selected' : '')
				+ (state === 'faded' ? ' configuration__image--faded' : '')}
			alt=''
			height={height}
			onClick={handleClick}
	//		src={ 'https://' + window.location.hostname + src }
			src={ src }
			onLoad={handleLoading} />
	);

})

export default Image;