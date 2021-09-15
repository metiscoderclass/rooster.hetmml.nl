# Build command:
# hetmml/rooster:stable
#   docker build . --build-arg=SCHOOL=metis --build-arg=SCHOOL_LEVEL=havo-vwo -t hetmml/rooster:stable
# hetmml/rooster:stable-mavo
#   docker build . --build-arg=SCHOOL=metis --build-arg=SCHOOL_LEVEL=mavo -t hetmml/rooster:stable-mavo
# hetmml/rooster:stable-kiemm
#   docker build . --build-arg=SCHOOL=kiemm --build-arg=SCHOOL_LEVEL=mavo -t hetmml/rooster:stable-kiemm
FROM ubuntu
ARG SCHOOL=metis
ARG SCHOOL_LEVEL=havo-vwo

RUN apt-get update
RUN apt-get install -y curl build-essential apt-transport-https
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs yarn

COPY . /var/www
WORKDIR /var/www

RUN npm install
RUN if [ "$SCHOOL" = "kiemm" ]                                      ;\
    then if [ "$SCHOOL_LEVEL" = "mavo" ]                            ;\
         then npm run build-kiemm                                   ;\
         else echo "SCHOOL_LEVEL must be mavo is SCHOOL is kiemm"   ;\
              exit 1                                                ;\
         fi                                                         ;\
    else if [ "$SCHOOL_LEVEL" = "mavo" ]                            ;\
         then npm run build-mavo                                    ;\
         else npm run build                                         ;\
         fi                                                         ;\
    fi

ENV PORT=80
ENV SCHOOL=$SCHOOL
ENV SCHOOL_LEVEL=$SCHOOL_LEVEL
EXPOSE 80

CMD node ./bin/www
