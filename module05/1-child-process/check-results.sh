file1=$(cat database/file1.ndjson| grep gmail | wc -l | bc)
file2=$(cat database/file2.ndjson| grep gmail | wc -l | bc)
file3=$(cat database/file3.ndjson| grep gmail | wc -l | bc)
current=$(cat database/output-gmail.ndjson| grep gmail | wc -l | bc)
total=$(echo "$file1 + $file2 + $file3" | bc)

if [ "$total" = "$current" ]; then
    echo "All right - found $current items :)"
else
    echo "Something went wrong - expected $total items, but found $current"
fi