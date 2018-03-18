# Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

Tensorflow on CPU version
* [docker](https://www.docker.com)

Tensorflow on GPU version
* [docker](https://www.docker.com)
* nvidia GPU
* CUDA drivers
* [nvidia-docker](https://github.com/NVIDIA/nvidia-docker)

## Running the container

In order to start the development environment, run the env.sh script from anywhere inside the repo:
```
./environment/env.sh start
```

To build the gpu-enabled environment, do

```
./environment/env.sh start -gpu
```

From inside the container, start the frontend or backend with their respective start.sh scripts or run both with utils/run.sh

## Other environment utilities

* Connect to an already running container
```
./environment/env.sh connect
```

* Remove nnvis images (both cpu and gpu)
```
./environment/env.sh clean
```

## Running tests

### Frontend

todo - no tests yet

### Backend

To run backend tests, inside the container invoke

```
backend/test.sh
```

## Random stuff here

Work in progress

![Alt Text](https://media.giphy.com/media/Jg41tM6Bk71te/giphy.gif)
