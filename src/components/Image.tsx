type ImageProps = {
	src: string;
	height: number;
	handleLoading: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
};

const Image = ({ src, height, handleLoading }: ImageProps) => {

	return (
		<img
			className='configuration__image'
			alt=''
			height={height}
	//		src={ 'https://' + window.location.hostname + src }
			src={ 'http://' + window.location.hostname + ':8000/' + src }
			onLoad={handleLoading} />
	);

}

export default Image;