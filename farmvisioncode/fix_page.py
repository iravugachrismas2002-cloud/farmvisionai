import re

with open(r'C:\Users\user\farmvisioncode\frontend\src\app\admin\pending-accounts\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove async from handleApprove and handleReject
content = content.replace('const handleApprove = async (userId: string) => {', 'const handleApprove = (userId: string) => {')
content = content.replace('const handleReject = async (userId: string) => {', 'const handleReject = (userId: string) => {')

# Remove await from fetch calls - need to be more careful with the pattern
# The pattern is: await fetch(`${window.location.origin}/api/admin/pending-accounts`, {
content = content.replace('await fetch(`${window.location.origin}/api/admin/pending-accounts`, {', 'fetch(`${window.location.origin}/api/admin/pending-accounts`, {')

with open(r'C:\Users\user\farmvisioncode\frontend\src\app\admin\pending-accounts\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')