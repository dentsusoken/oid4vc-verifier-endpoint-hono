FROM public.ecr.aws/lambda/nodejs:20

ENV ENV=development

COPY ./dist ./dist

CMD ["dist/index.handler"]
