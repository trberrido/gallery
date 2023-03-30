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
		const imagesData = structuredClone(state.orderedImages) as ImagesInformations[];
		const index = state.data.findIndex(item => item === action.payload.src)
		imagesData[index] = action.payload;
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
	const [highlight, setHighLight] = useState(-1);

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
					w: e.currentTarget.naturalWidth,
					h: e.currentTarget.naturalHeight
				}
			}
		})
		globalDispatch({
			type: 'increment',
			payload: { field: 'loaded' }
		})
	}

	const fitResize = (list:ImagesInformations[]) => {
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;
		const dimensions:Dimensions[] = list.map(image => image.dimensions!);
		var newHeight = windowHeight;
		do {
			const getUpdatedDimensions = (height:number, dimensions:Dimensions[]):Dimensions[] => {
				return dimensions.map((d) => ({ w: height * d.w / d.h, h: height }) )
			}
			const dimensionsUpdated = getUpdatedDimensions(newHeight, dimensions);
			var {nbRows} = dimensionsUpdated.reduce((acc, curr) => {
				// note : the +2 corresponds to the images margins.
				const width = acc.width + curr.w + 2 >= windowWidth ? curr.w + 2 : acc.width + curr.w + 2
				const rows = acc.width + curr.w + 2 >= windowWidth ? acc.nbRows + 1 : acc.nbRows
				return ({
					nbRows: rows,
					width: width
				});
			}, {nbRows: 1, width: 0})
			newHeight -= 1;
		} while (nbRows * (newHeight + 2) > windowHeight)
		return newHeight;
	}

	useEffect(() => {
		if (isComplete)
			setHeight(fitResize(listImages));
		// eslint-disable-next-line
	}, [listImages])

	useEffect(() => {
		if (isComplete === true)
			setListImages(structuredClone(state.orderedImages));
		// eslint-disable-next-line
	}, [isComplete])

	useEffect(() => {
		const handleResize = () => {
			if (isComplete)
				setHeight(fitResize(listImages))
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
				listImages.map((image, indexImage) => (
					<Image
						highLight={highlight}
						setHighLight={setHighLight}
						height={height}
						handleLoading={handleLoading}
						key={image.src}
						indexConfiguration={index}
						indexImage={indexImage}
						src={image.src} />
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