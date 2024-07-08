//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract airdock{
    address public owner;
    uint public totalhangers=6;
    uint public total_planes=0;

    constructor(){
        owner=msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender==owner,"Only Owner Can Access");
        _;
    }

    mapping(uint=>bool) public hangeravailability;
    mapping(uint=>address) public planeathanger;

    function dockPlane(address _planeaddress) public onlyOwner{
        require(total_planes<6,"no hanger available");
        for(uint i=1;i<=6;i++){
            if(hangeravailability[i]==false){
                hangeravailability[i]=true;
                planeathanger[i]=_planeaddress;
                total_planes++;
                break;
            }
        }
    }

    function undockPlane(address _planeaddress)public onlyOwner{
        require(total_planes>0,"no plane to remove");
        uint hangerofplane=1;
        bool planefound=false;

        for(uint i=1;i<=6;i++){
            if(planeathanger[i]==_planeaddress){
                hangerofplane=i;
                planefound=true;
            }
        }

        planeathanger[hangerofplane]=address(0);
        hangeravailability[hangerofplane]=false;
        total_planes--;

        if(!planefound){
            revert("Plane Not Found!");
        }

    }

    function assertAvailabilty() public view{
        assert(total_planes>0 && total_planes<=6);
    }
}