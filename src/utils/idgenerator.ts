const idGenerator = (length: number) => {
	const availableCharacters = 'ABCDEFGHIJKLMNOPQURSTUVWXZ0123456789_-@#$%&';
	const charactersLength = availableCharacters.length;
	let index = 0;
	let id = '';
	while (index < length){
		id += availableCharacters.charAt(Math.round(Math.random() * (charactersLength - 1)))
		index +=1;
	}
	return id;
}

export default idGenerator;