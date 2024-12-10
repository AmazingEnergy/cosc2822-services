FROM public.ecr.aws/lambda/nodejs:22

# Copy application code to container
# https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
COPY . ${LAMBDA_TASK_ROOT}

# Install dependencies
RUN npm install

# Set the command to invoke the Lambda function
CMD ["index.handler"]
