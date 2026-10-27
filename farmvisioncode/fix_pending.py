with open(r'C:\Users\user\farmvisioncode\frontend\src\app\admin\pending-accounts\page.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Remove await from fetch calls in handleApprove and handleReject
    line = line.replace('await fetch(', 'fetch(')
    new_lines.append(line)

with open(r'C:\Users\user\farmvisioncode\frontend\src\app\admin\pending-accounts\page.tsx', 'w') as f:
    f.writelines(new_lines)

print('Done removing await')