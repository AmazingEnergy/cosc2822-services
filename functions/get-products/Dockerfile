FROM public.ecr.aws/lambda/nodejs:16

# Copy application code to container
# https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Set the command to invoke the Lambda function
CMD ["index.handler"]
