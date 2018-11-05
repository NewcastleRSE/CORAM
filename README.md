# CORAM
d3 visualisation of flow of cases through Kent County Council's Child Services department.

#### Developers

[Mark Turner](https://github.com/markdturner)  
[James Geddes](https://github.com/triangle-man)  

#### Partners

Matthew Wagner (matthew.wagner@kent.gov.uk)

## Development Build

The application is built using ES6 and SCSS. It uses NPM for its package management and webpack for its build process.

#### Docker

It is advised to use Docker as it provides a clean development environment away from the specifics of the development machine.

1. Build the Dockerfile by running the build script at the root level using

    ```
    docker-compose -f docker-compose-dev.yaml build --no-cache
    ```

    This creates a Docker image tagged as `coram:latest`

2. Start a container using that image

    ```
    docker-compose -f docker-compose-dev.yaml up -d
    ```

3. The command `npm run start` runs when the container starts up, which triggers webpack to start the application in development mode on port 9000.

4. To view the application go to [http://0.0.0.0:9000](http://0.0.0.0:9000)
   
#### Run Locally

If you wish to not use Docker and run the code on your local environment use the following steps.

1. Install the latest long term support version of node. Using [Node Version Manager](https://github.com/creationix/nvm) is probably the best way of doing this.

2. Install globally required packages. 
    
    ```
    npm install
    ``` 
    
3. Run validation tasks and start web server

    ```
    npm run start
    ```

## Production Build

It is advised to use Docker as it provides a container that can be deployed across different infrastructures.

1. Build the Dockerfile by running the build script at the root level using

    ```
    docker-compose build
    ```

    This creates a Docker image tagged as `coram:{tag}`

2. Start a container using that image

    ```
    docker-compose up -d
    ```

3. The Docker file uses a build step to run `npm run build` which packages and minifies the source files. The minifed files are deployed into an Nginx container based on Alpine Linux running on port 80.

4. To view the application go to [http://0.0.0.0](http://0.0.0.0)

5. Deploy the container to a container registry and deployment service of your choice.
   