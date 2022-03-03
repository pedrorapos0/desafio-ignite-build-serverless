import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "../utils/dynamoDbClient";
import { randomUUID } from "crypto";

interface ICreateTodo {
  title: string;
  deadline: Date;
  done: boolean;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { title, done, deadline } = JSON.parse(event.body) as ICreateTodo;
  const id = randomUUID();
  await document
    .put({
      TableName: "todos-users",
      Item: {
        id, 
        title,
        done,
        deadline: new Date(deadline).getTime(),
      },
    })
    .promise();

  const response = await document.query({
    TableName: "todos-users",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id,
    },
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify(response.Items[0]),
  };
};
