import React, { useReducer, useState, useEffect, memo } from 'react';

import Image from './Image';
import ZoomLayout from './ZoomLayout';
import { useGlobalContext } from '../Context';

import './Configuration.css';

type Dimensions = {w: number; h: number; }

type ImagesInformations = {
	src: string;
	dimensions?: Dimensions
}

type State = {
	loaded: number;
	data: string[];
	orderedImages: ImagesInformations[];
	setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
}

type Action = {
	type: 'loaded';
	payload: ImagesInformations;
}

const reducer = (state: State, action: Action):State => {
	if (action.type === 'loaded'){
		const loaded = state.loaded + 1;
		const imagesData = structuredClone(state.orderedImages);
		imagesData.push(action.payload);
		if (loaded === state.data?.length)
			state.setIsComplete(true);
		return ({...state,
			loaded: loaded,
			orderedImages: imagesData
		})
	}
	return (state);
}

type ConfigurationProps = {
	images: string[];
	index: number;
}

const Configuration = memo(({images, index}: ConfigurationProps) => {

	const {globalState, globalDispatch} = useGlobalContext();
	const display = globalState.currentConfiguration === index;
	const [listImages, setListImages] = useState<ImagesInformations[]>(images.map((image) => {return ({src: image})}));
	const [isComplete, setIsComplete] = useState(false);
	const initialState:State = {
		loaded: 0,
		data: images,
		orderedImages: [],
		setIsComplete: setIsComplete
	}
	const [state, dispatch] = useReducer(reducer, initialState);
	const [height, setHeight] = useState(window.innerHeight);

	const handleLoading = (e:React.SyntheticEvent<HTMLImageElement, Event>) => {
		dispatch({
			type: 'loaded',
			payload: {
				src: e.currentTarget.src,
				dimensions: {
					w: e.currentTarget.width,
					h: e.currentTarget.height,
				}
			}
		})
		globalDispatch({
			type: 'increment',
			payload: { field: 'loaded' }
		})
	}

	const fitResize = (list:ImagesInformations[]) => {
		let newHeight = window.innerHeight;
		const dimensions = list.map(image => image.dimensions!);
		do {
			let safeHeight = newHeight;
			let dimensionsTmp = dimensions.map((d) => ({ w: Math.ceil(safeHeight * d.w / d.h), h: safeHeight}))
			var {nbRows} = dimensionsTmp.reduce((acc, curr) => {
				let nextAcc = {
					width: acc.width + curr.w,
					nbRows: acc.nbRows
				}
				if (nextAcc.width >= window.innerWidth * .8){
					nextAcc.width = 0;
					nextAcc.nbRows += 1;
				}
				return nextAcc;
			}, {nbRows: 1, width: 0})
			newHeight -= 1;
		} while (nbRows * newHeight > window.innerHeight)
		return newHeight;
	}

	useEffect(() => {
		if (isComplete)
			setHeight(fitResize(listImages));
		// eslint-disable-next-line
	}, [listImages])

	useEffect(() => {
		if (isComplete === true){
			setListImages(structuredClone(state.orderedImages));
		}
		// eslint-disable-next-line
	}, [isComplete])

	useEffect(() => {
		const handleResize = () => {
			setHeight(fitResize(listImages));
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
		// eslint-disable-next-line
	}, [listImages]);

	/* Applying randomised or orderering commands */
	useEffect(() => {
		if (globalState.status === 'closed'
			|| globalState.currentConfiguration !== index
			|| globalState.command === 'done')
			return;
		if (globalState.command === 'random'){
			type Map1 = { value: ImagesInformations; sort: number; }
			type Map2 = { value: ImagesInformations; }
			const randListImages:ImagesInformations[] = structuredClone(listImages)
				.map((value:ImagesInformations) => ({ value, sort: Math.random() }))
				.sort((a:Map1, b:Map1) => a.sort - b.sort)
				.map(({ value }:Map2) => value)
			setListImages(randListImages);
		}
		if (globalState.command === 'order'){
			setListImages(state.orderedImages);
		}
		globalDispatch({
			type: 'update',
			payload: {
				command: 'done'
			}
		})
		// eslint-disable-next-line
	}, [globalState.command])

	return (
		<div className={'configuration configuration' + (display && isComplete ? '--visible' : '--hidden')}>
			{
				listImages.map(imageData => imageData.src).map((image, indexImage) => (
					<Image
						height={height}
						handleLoading={handleLoading}
						key={image}
						indexConfiguration={index}
						indexImage={indexImage}
						src={image} />
				))
			}
			{
				(globalState.mode === 'zoom' && globalState.currentConfiguration === index) &&
				<ZoomLayout
					src={listImages[globalState.currentZoom].src} />
			}
		</div>
	);
})

export default Configuration;