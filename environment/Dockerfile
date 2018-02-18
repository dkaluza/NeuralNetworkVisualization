FROM ubuntu:16.04

ADD requirements.txt /
WORKDIR /shared/frontend/NNVisualization

RUN    apt-get update -y \
    && apt-get install software-properties-common -y \
    && apt-add-repository ppa:git-core/ppa \
    && apt-get install python3-pip -y \
    && apt-get install git -y \
    && apt-get install curl -y \
    && apt-get install vim -y \
    && apt-get install net-tools -y \
    && pip3 install -r /requirements.txt \
    && curl -sL https://deb.nodesource.com/setup_8.x | bash - \
    && apt-get install -y nodejs

RUN useradd -ou 0 -g 0 -m node

RUN mkdir /home/node/.npm-global

ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

USER node

RUN npm install --unsafe -g @angular/cli

USER root
WORKDIR /shared

EXPOSE 4200

CMD ["/bin/bash"]
