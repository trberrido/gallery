# Gallery

This project is made with React and Typescript, to present sets of images.

## Commands

- A, then pick a picture : highlight a line of images
- S, then pick some pictures, then press Enter : create a new set of picture
- R : randomize the current set of pictures
- O : re-ordenate the pictures, if randomized
- ← / → : switch between pictures or between the sets of pictures
- click on a picture : fullscreen this picture
- spacebar / escape : close fullscreen

## Images

The list of pictures available directly on this entry: `/api/`

This list will be generate from the pictures in the `/api/assets/`

## Local

Once the front is bundled, the api can be called localy with a simple `php -S localhost:8000`.