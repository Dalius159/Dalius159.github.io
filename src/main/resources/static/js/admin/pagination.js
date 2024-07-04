function renderPagination(currentPage, totalPages) {
    $('.pagination').empty(); // Clear pagination before rendering

    const prevDisabled = (currentPage === 1) ? 'disabled' : '';
    const nextDisabled = (currentPage === totalPages) ? 'disabled' : '';

    for(let numberPage = 1; numberPage <= totalPages; numberPage++) {
        const liClass = (numberPage === currentPage) ? 'page-item active' : 'page-item';
        const li = '<li class="' + liClass + '"><a class="page-link pageNumber" href="#" data-page="' + numberPage + '">' + numberPage + '</a></li>';
        $('.pagination').append(li);
    }
}
