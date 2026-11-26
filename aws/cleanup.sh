#!/bin/bash
# cleanup.sh — DELETE everything this project created, in dependency order.
# Run this the SAME DAY you finish the demo, or the ALB keeps charging.
# Replace the names with your real ones, then run each section and confirm.
set -e
REGION=ap-south-1
ASG=library-asg
ALB=library-alb
TG=library-tg
LT=library-lt
BUCKET=YOUR-BUCKET-NAME
VPC_ID=YOUR-VPC-ID
ROLE=Library-EC2-S3-Role

echo "1. Delete Auto Scaling Group (terminates EC2 instances)..."
aws autoscaling delete-auto-scaling-group --auto-scaling-group-name $ASG --force-delete --region $REGION

echo "2. Delete Load Balancer..."
aws elbv2 delete-load-balancer --load-balancer-arn $(aws elbv2 describe-load-balancers --names $ALB --query 'LoadBalancers[0].LoadBalancerArn' --output text --region $REGION) --region $REGION

echo "3. Delete Target Group..."
aws elbv2 delete-target-group --target-group-arn $(aws elbv2 describe-target-groups --names $TG --query 'TargetGroups[0].TargetGroupArn' --output text --region $REGION) --region $REGION

echo "4. Delete Launch Template..."
aws ec2 delete-launch-template --launch-template-name $LT --region $REGION

echo "5. Empty + delete S3 bucket..."
aws s3 rm s3://$BUCKET --recursive --region $REGION
aws s3api delete-bucket --bucket $BUCKET --region $REGION

echo "6. Delete VPC (subnets, route tables, IGW, security groups first in console)..."
aws ec2 delete-vpc --vpc-id $VPC_ID --region $REGION

echo "7. Delete IAM role + instance profile..."
aws iam remove-role-from-instance-profile --instance-profile-name $ROLE --role-name $ROLE --region $REGION || true
aws iam delete-instance-profile --instance-profile-name $ROLE --region $REGION || true
aws iam delete-role --role-name $ROLE --region $REGION || true

echo "Done. Verify in the console: EC2, Load Balancers, ASG, S3, VPC all empty,"
echo "then check Billing / Cost Explorer — nothing should keep charging."
echo "NOTE: this does NOT rotate the Atlas password — do that in Atlas Database Access."
