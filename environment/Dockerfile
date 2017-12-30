FROM ubuntu:17.04

ADD requirements.txt /shared
WORKDIR /shared/frontend/NNVisualization

RUN apt-add-repository ppa:git-core/ppa \
    && apt-get update -y \
    && apt-get install python3-pip -y \
    && apt-get install git -y \
    && pip3 install -r requirements.txt \
    && curl -sL https://deb.nodesource.com/setup_8.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g @angular/cli \
    && npm install

EXPOSE 80

CMD ["/bin/bash"]
