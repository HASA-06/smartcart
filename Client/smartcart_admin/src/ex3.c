#include <stdio.h>
#include <string.h>
#include <sqlca.h>

EXEC SQL BEGIN DECLARE SECTION;
char connstr[30];
EXEC SQL END DECLARE SECTION;

void SqlConnect() 
{
	strcpy_s(connstr, 30, "sksuk/sksuk@sksuk");
	EXEC SQL CONNECT :connstr;

	if(sqlca.sqlcode != 0 && sqlca.sqlcode != -1405)
	{
		printf("\n connect error message = %s", sqlca.sqlerrm.sqlerrmc);
	} else
		printf("\n *********** DB CONNECT SUCCESS ***********");
}

void SqlInsert() {
	EXEC SQL BEGIN DECLARE SECTION;
	char c_no[16], c_name[21], c_addr[61], c_phone[17], c_dist[3];
	EXEC SQL END DECLARE SECTION;

	printf("\n insert할 값을 입력하세요.\n");
	printf("\n 고객번호 : " );
	scanf("%s", c_no);
	printf("\n 고객이름 : " );
	scanf("%s", c_name);
	printf("\n 고객주소 : " );
	scanf("%s", c_addr);
	printf("\n 고객전화 : " );
	scanf("%s", c_phone);
	printf("\n 고객구분 : " );
	scanf("%s", c_dist);

	EXEC SQL INSERT INTO customer value(:c_no, :c_name, :c_addr, :c_phone, :c_dist);
	printf("  insert complete \n\n");
	EXEC SQL COMMIT WORK;
}

void SqlSelect() 
{
	EXEC SQL BEGIN DECLARE SECTION;
	char c_no[16], c_name[21], c_addr[61], c_phone[17], c_dist[3];
	EXEC SQL END DECLARE SECTION;

	EXEC SQL DECLARE customer_cursor CURSOR FOR SELECT c_no, c_name, c_addr, c_phone, c_dist FROM customer;
	EXEC SQL OPEN customer_cursor;
	EXEC SQL FETCH customer_cursor INTO :c_no, :c_name, :c_addr, :c_phone, :c_dist;

	if(sqlca.sqlcode != 0 && sqlca.sqlcode != -1405)
	{
		EXEC SQL CLOSE customer_cursor;
		return;
	}

	while(1)
	{
		printf("\n\n 고객 번호 = %s", c_no);
		printf("\n 고객 이름 = %s", c_name);
		printf("\n 고객 주소 = %s", c_addr);
		printf("\n 전화 번호 = %s", c_phone);
		printf("\n 개인/고객 = %s", c_dist);

		EXEC SQL FETCH customer_cursor INTO :c_no, :c_name, :c_addr, :c_phone, :c_dist;

		if(sqlca.sqlcode != 0 && sqlca.sqlcode != -1405)
		{
			EXEC SQL CLOSE customer_cursor;
			break;
		}

		EXEC SQL CLOSE customer_cursor;
	}

	EXEC SQL COMMIT WORK;
}

void SqlUpdate() {
	EXEC SQL BEGIN DECLARE SECTION;
	char c_no[16], c_name[21];
	EXEC SQL END DECLARE SECTION;

	printf("\n update할 값을 입력하세요.\n");
	printf("\n 고객번호 : ");
	scanf("%s", c_no);
	printf("\n 고객이름 : ");
	scanf("%s", c_name);

	EXEC SQL UPDATE customer set c_name = :c_name where c_no = :c_no;
	printf("  update complete\n\n");

	EXEC SQL COMMIT WORK;
}

void SqlDelete() {
	EXEC SQL BEGIN DECLARE SECTION;
	char c_no[16], c_name[21];
	EXEC SQL END DECLARE SECTION;

	printf("\n delete할 값을 입력하세요.\n");
	printf("\n 고객번호 : ");
	scanf("%s", c_no);

	EXEC SQL DELETE customer where c_no = :c_no;
	printf("  delete complete\n\n");

	EXEC SQL COMMIT WORK;
}

void main()
{
	char ch;
	SqlConnect();

	while(1) {
		printf("\n (I)Insert\t (S)Select\t (U)Update\t (D)Delete\n");
		printf("원하는 메뉴를 선택하세요(종료 : Q) : ");
		scanf("%c", &ch);
		printf("\n");

		switch(ch) {
			case 'I' : SqlInsert(); break;
			case 'S' : SqlSelect(); break;
			case 'U' : SqlUpdate(); break;
			case 'D' : SqlDelete(); break;
			case 'Q' : EXEC SQL COMMIT WORK; return;
		}
	}
}