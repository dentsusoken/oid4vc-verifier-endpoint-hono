#!/bin/bash

# DynamoDBローカルが起動するまで待機
sleep 5

# テーブルが存在するか確認
aws dynamodb describe-table \
    --table-name ${TABLE_NAME} \
    --endpoint-url ${DYNAMODB_ENDPOINT} > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "Table ${TABLE_NAME} already exists"
    exit 0
fi

# テーブルが存在しない場合は作成
aws dynamodb create-table \
    --table-name ${TABLE_NAME} \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url ${DYNAMODB_ENDPOINT}

# 終了コードを確認
if [ $? -eq 0 ]; then
    echo "Table created successfully"
    exit 0
else
    echo "Failed to create table"
    exit 1
fi